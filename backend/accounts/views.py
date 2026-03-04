import logging
import random
from django.contrib.auth.hashers import make_password
from django.core.cache import cache
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import RegistrationOTP, CustomUser, ApprovedUniversityEmail
from .serializers import (
    SendOTPSerializer,
    VerifyOTPSerializer,
    CustomTokenObtainPairSerializer,
    RegistrationSerializer,
)


# ============================================================================
# New Clean Registration API
# ============================================================================

class RegisterView(APIView):
    """
    Clean registration endpoint.
    - Validates duplicate emails and usernames
    - Creates user with hashed password using create_user()
    - Does NOT auto-login
    - Returns user-friendly success message
    """

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)

        if not serializer.is_valid():
            # Return user-friendly error messages
            errors = {}
            for field, messages in serializer.errors.items():
                errors[field] = str(messages[0]) if messages else "Invalid input"
            return Response(
                {"errors": errors, "message": "Registration failed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = serializer.save()
            return Response(
                {
                    "message": "Registration successful. Please login to continue.",
                    "email": user.email,
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return Response(
                {
                    "errors": {"detail": "Registration failed. Please try again."},
                    "message": "An unexpected error occurred.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ============================================================================
# New Clean Login API
# ============================================================================

class LoginView(TokenObtainPairView):
    """
    Clean login endpoint using JWT tokens.
    - Accepts username (email) and password
    - Returns JWT token + role for frontend routing
    - Role-based response:
      - "university" if email exists in ApprovedUniversityEmail
      - "user" otherwise
      - "admin" if is_superuser
    """
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        print(f"[DEBUG] LoginView - request.method: {request.method}")
        print(f"[DEBUG] LoginView - request.body: {request.body}")
        print(f"[DEBUG] LoginView - request.data: {request.data}")
        return super().post(request, *args, **kwargs)


# ============================================================================
# Legacy OTP Views (kept for backward compatibility)
# ============================================================================

class SendOTPView(APIView):
    """Generate and send OTP to email for registration using cache."""

    def post(self, request):
        print(f"[DEBUG] SendOTPView - request.data: {request.data}")
        
        serializer = SendOTPSerializer(data=request.data)
        if not serializer.is_valid():
            print(f"[DEBUG] SendOTPView - Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        
        # Generate 6-digit OTP
        otp = f"{random.randint(100000, 999999):06d}"
        
        # Store OTP in cache with 5-minute expiry (300 seconds)
        cache.set(email, otp, timeout=300)
        
        # Print OTP to console for development
        print(f"\n[OTP SENT] Email: {email} | OTP: {otp} | Expires: 5 minutes")
        logger = logging.getLogger(__name__)
        logger.info(f"[OTP SENT] Email: {email} | OTP: {otp}")
        
        # Send OTP via email
        try:
            subject = "Email Verification OTP"
            message = f"Your verification OTP is: {otp}"
            send_mail(
                subject,
                message,
                None,  # Uses DEFAULT_FROM_EMAIL from settings
                [email],
                fail_silently=False,
            )
            print(f"[EMAIL SENT] OTP email sent to {email}")
        except Exception as e:
            logger.warning(f"[EMAIL SEND FAILED] Could not send OTP email to {email}: {str(e)}")
            print(f"[EMAIL SEND FAILED] Could not send OTP email to {email}: {str(e)}")
        
        return Response(
            {"message": "OTP sent to your email", "email": email},
            status=status.HTTP_200_OK
        )


class VerifyOTPView(APIView):
    """Verify OTP from cache; if valid, create CustomUser and return success."""

    def post(self, request):
        print(f"[DEBUG] VerifyOTPView - request.data: {request.data}")
        
        # Get email and OTP from request
        email = request.data.get('email')
        entered_otp = request.data.get('otp')
        
        # Validate input
        if not email or not entered_otp:
            return Response(
                {"error": "Email and OTP are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Retrieve OTP from cache
        stored_otp = cache.get(email)
        
        # Debug prints
        print(f"[DEBUG] Stored OTP: {stored_otp}")
        print(f"[DEBUG] Entered OTP: {entered_otp}")
        
        # Check if OTP exists in cache
        if stored_otp is None:
            print(f"[DEBUG] OTP not found in cache for {email}")
            return Response(
                {"error": "OTP expired or not found. Please request a new OTP."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Compare OTPs as strings
        if str(stored_otp) != str(entered_otp):
            print(f"[DEBUG] OTP mismatch: stored={stored_otp}, entered={entered_otp}")
            return Response(
                {"error": "Invalid OTP"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # OTP is correct, create or update user
        print(f"[DEBUG] OTP verified successfully for {email}")
        
        # Determine role based on email
        role = None
        if CustomUser.objects.filter(email=email, is_superuser=True).exists():
            role = None  # admin users rely on is_superuser
        elif ApprovedUniversityEmail.objects.filter(email=email).exists():
            role = "UNIVERSITY"
        else:
            role = "NORMAL_USER"
        
        # Check if user already exists
        try:
            user = CustomUser.objects.get(email=email)
            print(f"[DEBUG] User already exists: {email}")
        except CustomUser.DoesNotExist:
            # Create new user
            user = CustomUser(
                username=email,  # Use email as username
                email=email,
                role=role,
            )
            if CustomUser.objects.filter(email=email, is_superuser=True).exists():
                user.is_superuser = True
                user.is_staff = True
            # Set empty password (user should set password in registration step)
            user.password = make_password('')
            user.save()
            print(f"[DEBUG] User created: {email}")
        
        # Delete OTP from cache after successful verification
        cache.delete(email)
        print(f"[DEBUG] OTP deleted from cache")
        
        return Response(
            {"message": "OTP verified successfully", "email": email},
            status=status.HTTP_200_OK
        )
