from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import CustomUser, RegistrationOTP, ApprovedUniversityEmail
from django.utils import timezone
from datetime import timedelta


# ============================================================================
# Registration Serializers
# ============================================================================

class RegistrationSerializer(serializers.Serializer):
    """
    Simple registration serializer that validates input and checks for duplicates.
    Does NOT auto-login after registration.
    """
    username = serializers.CharField(min_length=3, max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    password_confirm = serializers.CharField(min_length=6, write_only=True)

    def validate_email(self, value):
        """Check if email already exists."""
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "This email is already registered. Please login instead."
            )
        return value

    def validate_username(self, value):
        """Check if username already exists."""
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate(self, data):
        """Validate that passwords match."""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError(
                {"password": "Passwords do not match."}
            )
        return data

    def create(self, validated_data):
        """Create user WITHOUT auto-login. Use create_user() for password hashing."""
        email = validated_data['email']
        
        # Determine role based on email domain
        # Check if email is from an approved university
        role = None
        if ApprovedUniversityEmail.objects.filter(email=email).exists():
            role = "UNIVERSITY"
        else:
            # Default to NORMAL_USER for regular registrations
            role = "NORMAL_USER"
        
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=email,
            password=validated_data['password'],
            role=role,
        )
        return user


# ============================================================================
# Login Serializers
# ============================================================================

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom login serializer for JWT authentication.
    Uses standard JWT token generation without modification.
    Role is loaded from database during authentication.
    """
    username_field = 'email'
    
    def validate(self, attrs):
        """
        Validate credentials and return token + role information.
        """
        try:
            # Get email and password from attrs  
            email = attrs.get('email')
            password = attrs.get('password')
            
            print(f"[DEBUG] LoginView validating credentials for: {email}")
            
            # Use authenticate() to validate email and password
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )

            if user is None:
                print(f"[DEBUG] Authentication failed for: {email}")
                raise serializers.ValidationError("Invalid email or password.")

            print(f"[DEBUG] ✓ Authentication successful for: {user.email}")
            
            # Generate JWT tokens using standard SimpleJWT method
            # Tokens are valid and unmodified
            try:
                refresh = self.get_token(user)
            except Exception as token_err:
                print(f"[DEBUG] Error generating token: {str(token_err)}")
                raise serializers.ValidationError("Token generation failed.")
            
            # Build response with tokens
            data = {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'message': 'Login successful.',
            }

            # Determine role for frontend routing
            if user.is_superuser:
                role = 'admin'
            elif ApprovedUniversityEmail.objects.filter(email=user.email).exists():
                role = 'university'
            else:
                role = 'user'

            # Include role and user info in response (for frontend)
            data['role'] = role
            data['email'] = user.email
            data['username'] = user.username

            print(f"[DEBUG] Login successful - role={role}, email={email}")
            return data

        except serializers.ValidationError:
            raise
        except Exception as e:
            print(f"[DEBUG] Unexpected validation error: {str(e)}")
            import traceback
            traceback.print_exc()
            raise serializers.ValidationError("Invalid email or password.")


# ============================================================================
# Legacy OTP Serializers (kept for backward compatibility)
# ============================================================================

class SendOTPSerializer(serializers.Serializer):
    """Serializer for OTP request - only requires email."""
    email = serializers.EmailField()


class VerifyOTPSerializer(serializers.Serializer):
    """Serializer for OTP verification - accepts email and OTP code."""
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)
