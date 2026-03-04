from django.urls import path
from .views import SendOTPView, VerifyOTPView, LoginView, RegisterView

urlpatterns = [
    # New clean API endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),

    # Legacy OTP endpoints (kept for backward compatibility)
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
]