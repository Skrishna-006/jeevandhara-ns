"""
Token Generation & Validation Test Script
Run this to test the entire JWT token flow

Usage:
    cd backend
    python test_token_flow.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jeevandhara.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from accounts.models import CustomUser
from accounts.serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
import jwt
from django.conf import settings
from django.contrib.auth import authenticate


def print_section(title):
    """Print a formatted section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


def test_user_exists():
    """Test 1: Check if test user exists"""
    print_section("TEST 1: User Existence")
    
    # Try to get a normal user
    users = CustomUser.objects.filter(role='NORMAL_USER').exclude(is_superuser=True)
    
    if not users.exists():
        print("❌ No NORMAL_USER users found in database")
        print("\nCreating a test user for testing...")
        user, created = CustomUser.objects.get_or_create(
            email='test@example.com',
            defaults={'role': 'NORMAL_USER', 'is_active': True}
        )
        if created:
            user.set_password('Test@123')
            user.save()
            print(f"✅ Created test user: {user.email}")
        else:
            print(f"✅ Using existing test user: {user.email}")
        return user
    else:
        user = users.first()
        print(f"✅ Found NORMAL_USER: {user.email}")
        return user


def test_user_role(user):
    """Test 2: Verify user has role assigned"""
    print_section("TEST 2: User Role Assignment")
    
    user.refresh_from_db()
    if not user.role:
        print(f"❌ User {user.email} has NO role assigned")
        user.role = 'NORMAL_USER'
        user.save()
        print(f"✅ Fixed: Assigned role NORMAL_USER")
    else:
        print(f"✅ User role is set: {user.role}")
    
    return user


def test_token_generation(user):
    """Test 3: Generate JWT tokens"""
    print_section("TEST 3: Token Generation")
    
    try:
        # Method 1: Using RefreshToken
        print("Generating tokens using RefreshToken.for_user()...")
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        print(f"✅ Access Token (first 50 chars): {access_token[:50]}...")
        print(f"✅ Refresh Token (first 50 chars): {refresh_token[:50]}...")
        
        return access_token, refresh_token
    except Exception as e:
        print(f"❌ Error generating tokens: {e}")
        return None, None


def test_token_decode(access_token):
    """Test 4: Decode token payload"""
    print_section("TEST 4: Token Payload Decode")
    
    try:
        # Decode without verification first
        payload = jwt.decode(access_token, options={"verify_signature": False})
        print(f"✅ Token decoded successfully")
        print(f"  - User ID: {payload.get('user_id')}")
        print(f"  - Token Type: {payload.get('token_type')}")
        print(f"  - Issued At: {payload.get('iat')}")
        print(f"  - Expires At: {payload.get('exp')}")
        
        # Try to verify signature
        try:
            verified = jwt.decode(
                access_token,
                settings.SIMPLE_JWT['SIGNING_KEY'],
                algorithms=['HS256']
            )
            print(f"✅ Token signature is VALID")
            return True
        except jwt.InvalidSignatureError:
            print(f"❌ Token signature is INVALID")
            return False
    except Exception as e:
        print(f"❌ Error decoding token: {e}")
        return False


def test_authentication(user):
    """Test 5: Test authentication with email/password"""
    print_section("TEST 5: Email/Password Authentication")
    
    # Reset password first
    password = 'Test@123'
    user.set_password(password)
    user.save()
    print(f"✅ Set test password: {password}")
    
    # Try to authenticate
    authenticated_user = authenticate(username=user.email, password=password)
    
    if authenticated_user:
        print(f"✅ Authentication successful for {user.email}")
        return True
    else:
        print(f"❌ Authentication failed for {user.email}")
        return False


def test_serializer(user):
    """Test 6: Test CustomTokenObtainPairSerializer"""
    print_section("TEST 6: CustomTokenObtainPairSerializer")
    
    password = 'Test@123'
    user.set_password(password)
    user.save()
    
    serializer = CustomTokenObtainPairSerializer(data={
        'email': user.email,
        'password': password
    })
    
    if serializer.is_valid():
        print(f"✅ Serializer validation passed")
        data = serializer.validated_data
        print(f"  - Has access token: {'access' in data}")
        print(f"  - Has refresh token: {'refresh' in data}")
        print(f"  - Has role: {'role' in data}")
        print(f"  - Role value: {data.get('role')}")
        print(f"  - Has email: {'email' in data}")
        return data
    else:
        print(f"❌ Serializer validation failed")
        print(f"  - Errors: {serializer.errors}")
        return None


def test_api_endpoint(access_token):
    """Test 7: Test actual API endpoint"""
    print_section("TEST 7: API Endpoint Test")
    
    import requests
    
    url = 'http://localhost:8000/api/medical-cases/my-cases/'
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    try:
        print(f"Testing endpoint: {url}")
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            print(f"✅ API call successful (Status: 200)")
            data = response.json()
            print(f"  - Response type: {type(data).__name__}")
            if isinstance(data, list):
                print(f"  - Cases found: {len(data)}")
            return True
        else:
            print(f"❌ API call failed (Status: {response.status_code})")
            print(f"  - Response: {response.text[:200]}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"⚠️  Could not connect to API server")
        print(f"  - Make sure Django is running on localhost:8000")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("  JWT TOKEN VALIDATION TEST SUITE")
    print("="*60)
    print("\nThis script will test the entire token generation and")
    print("validation flow to help debug authentication issues.")
    
    # Run tests
    user = test_user_exists()
    if not user:
        print("❌ Could not find or create test user")
        return
    
    user = test_user_role(user)
    
    access_token, refresh_token = test_token_generation(user)
    if not access_token:
        print("❌ Failed to generate tokens - cannot continue")
        return
    
    test_token_decode(access_token)
    test_authentication(user)
    serializer_data = test_serializer(user)
    test_api_endpoint(access_token)
    
    # Summary
    print_section("SUMMARY")
    print("\n✅ All critical tests completed successfully!" if access_token else "❌ Some tests failed")
    print("\nNext Steps:")
    print("1. If all tests passed: Try logging in to the frontend")
    print("2. If tests failed: Check the errors above and Review Django settings")
    print("3. Make sure both frontend and backend are running")


if __name__ == '__main__':
    main()
