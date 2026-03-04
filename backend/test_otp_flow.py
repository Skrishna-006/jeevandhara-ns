#!/usr/bin/env python
"""
Test the verify-otp endpoint after fixing send-otp
"""
import json
import sys
import os

# Setup Django
sys.path.insert(0, '/d:/curetrust/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jeevandhara.settings')

import django
django.setup()

from rest_framework.test import APIClient
from accounts.models import RegistrationOTP

def test_verify_otp_flow():
    """Test the complete send-otp -> verify-otp flow"""
    print("=" * 70)
    print("TEST: Complete OTP Flow (Send + Verify)")
    print("=" * 70)
    
    client = APIClient()
    test_email = "flowtest@example.com"
    
    # Step 1: Send OTP
    print(f"\n✓ Step 1: Send OTP to {test_email}")
    response = client.post('/api/send-otp/', {"email": test_email}, format='json')
    assert response.status_code == 200, f"Send OTP failed: {response.json()}"
    print(f"  Response: {response.json()}")
    
    # Step 2: Get the OTP from database
    print(f"\n✓ Step 2: Retrieve OTP from database")
    otp_record = RegistrationOTP.objects.get(email=test_email)
    otp = otp_record.otp
    print(f"  OTP Code: {otp}")
    print(f"  OTP Record Email: {otp_record.email}")
    
    # Step 3: Verify OTP
    print(f"\n✓ Step 3: Verify OTP")
    response = client.post(
        '/api/verify-otp/',
        {"email": test_email, "otp": otp},
        format='json'
    )
    print(f"  Status: {response.status_code}")
    print(f"  Response: {response.json()}")
    
    if response.status_code == 201:
        print(f"✓ OTP verification successful!")
        print(f"  User registered")
        
        # Check if user was created
        from accounts.models import CustomUser
        try:
            user = CustomUser.objects.get(email=test_email)
            print(f"✓ User created in database:")
            print(f"  - Email: {user.email}")
            print(f"  - Username: {user.username}")
            print(f"  - Role: {user.role}")
        except CustomUser.DoesNotExist:
            print(f"✗ User not found in database")
    else:
        print(f"✗ OTP verification failed")
        print(f"  Error: {response.json()}")
    
    print("\n" + "=" * 70)
    print("✅ FLOW TEST COMPLETE!")
    print("=" * 70)

if __name__ == '__main__':
    test_verify_otp_flow()
