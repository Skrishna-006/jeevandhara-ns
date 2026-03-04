#!/usr/bin/env python
"""
Test the fixed send-otp endpoint
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

def test_send_otp():
    """Test send-otp endpoint with only email"""
    print("=" * 70)
    print("TEST: Send OTP with Email Only")
    print("=" * 70)
    
    client = APIClient()
    
    # Test 1: Valid email
    print("\n✓ Test 1: Send OTP with valid email")
    payload = {"email": "testuser@example.com"}
    response = client.post('/api/send-otp/', payload, format='json')
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    assert response.json().get('message'), "Missing message in response"
    assert response.json().get('email') == "testuser@example.com", "Email not in response"
    print("✓ Success!")
    
    # Test 2: Invalid email
    print("\n✓ Test 2: Send OTP with invalid email (should fail gracefully)")
    payload = {"email": "not-an-email"}
    response = client.post('/api/send-otp/', payload, format='json')
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    print("✓ Correctly rejected invalid email!")
    
    # Test 3: Missing email
    print("\n✓ Test 3: Send OTP without email (should fail)")
    payload = {}
    response = client.post('/api/send-otp/', payload, format='json')
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    print("✓ Correctly rejected missing email!")
    
    # Test 4: Ensure username and password NOT required
    print("\n✓ Test 4: Verify username/password NOT required")
    payload = {"email": "another@example.com"}  # Only email, no username/password
    response = client.post('/api/send-otp/', payload, format='json')
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    print("✓ Success - endpoint works with only email field!")
    
    print("\n" + "=" * 70)
    print("✅ ALL TESTS PASSED!")
    print("=" * 70)
    print("\nThe send-otp endpoint now:")
    print("  • Accepts only 'email' field")
    print("  • Generates 6-digit OTP automatically")
    print("  • Prints OTP to console for development")
    print("  • Returns email in response")

if __name__ == '__main__':
    test_send_otp()
