#!/usr/bin/env python
"""
Test the cache-based OTP system
"""
import json
import sys
import os
import time

# Setup Django
sys.path.insert(0, '/d:/curetrust/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jeevandhara.settings')

import django
django.setup()

from rest_framework.test import APIClient
from django.core.cache import cache

def test_cache_otp_flow():
    """Test complete cache-based OTP flow"""
    print("=" * 70)
    print("TEST: Cache-Based OTP System")
    print("=" * 70)
    
    client = APIClient()
    test_email = "cachetest@example.com"
    
    # Step 1: Send OTP
    print(f"\n✓ Step 1: Send OTP to {test_email}")
    response = client.post('/api/send-otp/', {"email": test_email}, format='json')
    print(f"  Status: {response.status_code}")
    print(f"  Response: {response.json()}")
    assert response.status_code == 200, f"Send OTP failed: {response.json()}"
    
    # Step 2: Verify OTP is in cache
    print(f"\n✓ Step 2: Verify OTP is stored in cache")
    stored_otp = cache.get(test_email)
    print(f"  Cached OTP for {test_email}: {stored_otp}")
    assert stored_otp is not None, "OTP not found in cache"
    assert len(stored_otp) == 6, f"OTP length should be 6, got {len(stored_otp)}"
    print(f"  ✓ OTP found in cache: {stored_otp}")
    
    # Step 3: Verify OTP with CORRECT code
    print(f"\n✓ Step 3: Verify with CORRECT OTP code")
    response = client.post(
        '/api/verify-otp/',
        {"email": test_email, "otp": stored_otp},
        format='json'
    )
    print(f"  Status: {response.status_code}")
    print(f"  Response: {response.json()}")
    assert response.status_code == 200, f"OTP verification failed: {response.json()}"
    assert response.json()["message"] == "OTP verified successfully"
    print(f"  ✓ OTP verified successfully!")
    
    # Step 4: Verify OTP is deleted from cache after verification
    print(f"\n✓ Step 4: Verify OTP is deleted from cache after verification")
    remaining_otp = cache.get(test_email)
    print(f"  Remaining OTP in cache: {remaining_otp}")
    assert remaining_otp is None, "OTP should be deleted after verification"
    print(f"  ✓ OTP properly deleted from cache")
    
    # Step 5: Test INCORRECT OTP
    print(f"\n✓ Step 5: Test verification with INCORRECT OTP")
    # Send new OTP first
    response = client.post('/api/send-otp/', {"email": "wrongotptest@example.com"}, format='json')
    assert response.status_code == 200
    stored_otp = cache.get("wrongotptest@example.com")
    print(f"  Sent OTP: {stored_otp}")
    
    # Try with wrong OTP
    wrong_otp = "999999"
    response = client.post(
        '/api/verify-otp/',
        {"email": "wrongotptest@example.com", "otp": wrong_otp},
        format='json'
    )
    print(f"  Status: {response.status_code}")
    print(f"  Response: {response.json()}")
    assert response.status_code == 400, "Should reject wrong OTP"
    assert "Invalid OTP" in response.json()["error"]
    print(f"  ✓ Correctly rejected wrong OTP")
    
    # Step 6: Test EXPIRED OTP
    print(f"\n✓ Step 6: Test verification with EXPIRED OTP")
    # Send OTP with very short timeout for testing
    from django.core.cache import cache as django_cache
    test_email_expired = "expiredotptest@example.com"
    otp_expired = "123456"
    django_cache.set(test_email_expired, otp_expired, timeout=1)  # 1 second
    print(f"  Set OTP in cache: {otp_expired}")
    print(f"  Waiting for cache to expire (2 seconds)...")
    time.sleep(2)
    
    response = client.post(
        '/api/verify-otp/',
        {"email": test_email_expired, "otp": otp_expired},
        format='json'
    )
    print(f"  Status: {response.status_code}")
    print(f"  Response: {response.json()}")
    assert response.status_code == 400, "Should reject expired OTP"
    assert "expired" in response.json()["error"].lower()
    print(f"  ✓ Correctly rejected expired OTP")
    
    # Step 7: Test missing email/OTP
    print(f"\n✓ Step 7: Test verification with missing fields")
    response = client.post(
        '/api/verify-otp/',
        {"email": "test@example.com"},  # Missing OTP
        format='json'
    )
    print(f"  Status: {response.status_code}")
    print(f"  Response: {response.json()}")
    assert response.status_code == 400, "Should reject missing OTP"
    print(f"  ✓ Correctly rejected missing OTP")
    
    print("\n" + "=" * 70)
    print("✅ ALL TESTS PASSED!")
    print("=" * 70)
    print("\nCache-Based OTP System Features:")
    print("  • OTP stored in Django cache (not database)")
    print("  • 5-minute expiration timeout")
    print("  • Proper string comparison")
    print("  • Debug logs for troubleshooting")
    print("  • OTP deleted after successful verification")
    print("  • Proper error messages for invalid/expired OTP")

if __name__ == '__main__':
    test_cache_otp_flow()
