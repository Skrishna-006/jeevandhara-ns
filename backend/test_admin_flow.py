#!/usr/bin/env python
"""
Test admin login and API access for medical cases, hospitals, and universities
"""
import json
import sys
import os

# Setup Django
sys.path.insert(0, '/d:/curetrust/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jeevandhara.settings')

import django
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def test_admin_credentials():
    """Test that admin user exists and has correct credentials"""
    print("=" * 70)
    print("TEST 1: Verify Admin User Exists")
    print("=" * 70)
    
    try:
        admin = User.objects.get(username='admin')
        print(f"✓ Admin user found")
        print(f"  - Username: {admin.username}")
        print(f"  - Email: {admin.email}")
        print(f"  - Is Superuser: {admin.is_superuser}")
        print(f"  - Is Staff: {admin.is_staff}")
        print(f"  - Role: {getattr(admin, 'role', 'N/A')}")
        return True
    except User.DoesNotExist:
        print("✗ Admin user NOT found")
        return False

def test_admin_token_generation():
    """Test that admin can generate JWT token"""
    print("\n" + "=" * 70)
    print("TEST 2: Generate JWT Token for Admin")
    print("=" * 70)
    
    try:
        admin = User.objects.get(username='admin')
        refresh = RefreshToken.for_user(admin)
        access_token = str(refresh.access_token)
        
        print(f"✓ JWT tokens generated successfully")
        print(f"  - Access token (first 50 chars): {access_token[:50]}...")
        print(f"  - Refresh token valid: {bool(refresh)}")
        return True, access_token
    except Exception as e:
        print(f"✗ Failed to generate token: {e}")
        import traceback
        traceback.print_exc()
        return False, None

def test_login_endpoint():
    """Test the login API endpoint"""
    print("\n" + "=" * 70)
    print("TEST 3: Test Login API Endpoint")
    print("=" * 70)
    
    client = APIClient()
    payload = {
        'email': 'admin@example.com',
        'password': 'admin@123'
    }
    
    try:
        response = client.post('/api/login/', payload, format='json')
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Login successful (Status: {response.status_code})")
            print(f"  - Access token received: {bool(data.get('access'))}")
            print(f"  - Role: {data.get('role', 'N/A')}")
            print(f"  - Email: {data.get('email', 'N/A')}")
            return True, data.get('access')
        else:
            print(f"✗ Login failed (Status: {response.status_code})")
            print(f"  - Response: {response.json()}")
            return False, None
    except Exception as e:
        print(f"✗ Login endpoint error: {e}")
        return False, None

def test_medical_cases_endpoint(access_token):
    """Test fetching medical cases with token"""
    print("\n" + "=" * 70)
    print("TEST 4: Fetch Medical Cases")
    print("=" * 70)
    
    if not access_token:
        print("✗ No access token provided, skipping test")
        return False
    
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    
    try:
        response = client.get('/api/medical-cases/')
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Medical cases fetched successfully (Status: {response.status_code})")
            print(f"  - Number of cases: {len(data)}")
            if data:
                print(f"  - First case ID: {data[0].get('id', 'N/A')}")
            return True
        else:
            print(f"✗ Failed to fetch cases (Status: {response.status_code})")
            print(f"  - Response: {response.json()}")
            return False
    except Exception as e:
        print(f"✗ Medical cases endpoint error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_hospitals_endpoint(access_token):
    """Test fetching hospitals with token"""
    print("\n" + "=" * 70)
    print("TEST 5: Fetch Hospitals")
    print("=" * 70)
    
    if not access_token:
        print("✗ No access token provided, skipping test")
        return False
    
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    
    try:
        response = client.get('/api/hospitals/')
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Hospitals fetched successfully (Status: {response.status_code})")
            print(f"  - Number of hospitals: {len(data)}")
            if data:
                print(f"  - First hospital: {data[0].get('name', 'N/A')}")
            return True
        else:
            print(f"✗ Failed to fetch hospitals (Status: {response.status_code})")
            print(f"  - Response: {response.json()}")
            return False
    except Exception as e:
        print(f"✗ Hospitals endpoint error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_universities_endpoint(access_token):
    """Test fetching universities with token"""
    print("\n" + "=" * 70)
    print("TEST 6: Fetch Universities")
    print("=" * 70)
    
    if not access_token:
        print("✗ No access token provided, skipping test")
        return False
    
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    
    try:
        response = client.get('/api/universities/')
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Universities fetched successfully (Status: {response.status_code})")
            print(f"  - Number of universities: {len(data)}")
            if data:
                print(f"  - First university: {data[0].get('name', 'N/A')}")
            return True
        else:
            print(f"✗ Failed to fetch universities (Status: {response.status_code})")
            print(f"  - Response: {response.json()}")
            return False
    except Exception as e:
        print(f"✗ Universities endpoint error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("\n" + "█" * 70)
    print("   ADMIN PANEL API TESTS")
    print("█" * 70)
    
    # Test 1: Admin user exists
    test_admin_credentials()
    
    # Test 2: Token generation
    success, token = test_admin_token_generation()
    
    # Test 3: Login endpoint
    success, login_token = test_login_endpoint()
    
    # Test 4-6: API endpoints
    if login_token:
        test_medical_cases_endpoint(login_token)
        test_hospitals_endpoint(login_token)
        test_universities_endpoint(login_token)
    
    print("\n" + "█" * 70)
    print("   TESTS COMPLETE")
    print("█" * 70)
