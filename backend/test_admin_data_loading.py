#!/usr/bin/env python
"""
Test admin panel data loading after login
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

def test_admin_data_loading():
    """Test that admin can load all data after successful login"""
    print("=" * 70)
    print("TEST: Admin Panel Data Loading After Login")
    print("=" * 70)
    
    client = APIClient()
    
    # Step 1: Admin Login
    print("\n✓ Step 1: Admin Login")
    response = client.post('/api/login/', {
        "email": "admin@example.com",
        "password": "admin@123"
    }, format='json')
    
    print(f"  Status: {response.status_code}")
    assert response.status_code == 200, f"Login failed: {response.json()}"
    data = response.json()
    access_token = data.get('access')
    print(f"  ✓ Login successful")
    print(f"  ✓ Access token received: {access_token[:50]}...")
    print(f"  ✓ Role: {data.get('role')}")
    
    # Step 2: Fetch Medical Cases with token
    print("\n✓ Step 2: Fetch Medical Cases")
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    response = client.get('/api/medical-cases/')
    print(f"  Status: {response.status_code}")
    assert response.status_code == 200, f"Failed to fetch cases: {response.json()}"
    cases = response.json()
    print(f"  ✓ Cases fetched: {len(cases)} cases")
    if cases:
        print(f"  ✓ First case: ID={cases[0].get('id')}, Status={cases[0].get('status')}")
    
    # Step 3: Fetch Hospitals with token
    print("\n✓ Step 3: Fetch Hospitals")
    response = client.get('/api/hospitals/')
    print(f"  Status: {response.status_code}")
    assert response.status_code == 200, f"Failed to fetch hospitals: {response.json()}"
    hospitals = response.json()
    print(f"  ✓ Hospitals fetched: {len(hospitals)} hospitals")
    if hospitals:
        print(f"  ✓ First hospital: {hospitals[0].get('name')}")
    
    # Step 4: Fetch Universities with token
    print("\n✓ Step 4: Fetch Universities")
    response = client.get('/api/universities/')
    print(f"  Status: {response.status_code}")
    assert response.status_code == 200, f"Failed to fetch universities: {response.json()}"
    universities = response.json()
    print(f"  ✓ Universities fetched: {len(universities)} universities")
    if universities:
        print(f"  ✓ First university: {universities[0].get('name', 'N/A')}")
    
    # Step 5: Verify token format is correct
    print("\n✓ Step 5: Verify Token Format")
    parts = access_token.split('.')
    print(f"  Token parts: {len(parts)}")
    assert len(parts) == 3, "Invalid JWT format"
    print(f"  ✓ Valid JWT format (3 parts)")
    
    # Step 6: Verify token is not None or empty
    print("\n✓ Step 6: Verify Token Validity")
    assert access_token, "Token is empty"
    assert len(access_token) > 50, "Token is suspiciously short"
    print(f"  ✓ Token length: {len(access_token)} characters")
    print(f"  ✓ Token is valid and non-empty")
    
    print("\n" + "=" * 70)
    print("✅ ALL TESTS PASSED!")
    print("=" * 70)
    print("\nAdmin Panel Data Loading Status:")
    print(f"  • Login: ✓ Success")
    print(f"  • Token: ✓ Valid JWT")
    print(f"  • Medical Cases: ✓ {len(cases)} loaded")
    print(f"  • Hospitals: ✓ {len(hospitals)} loaded")
    print(f"  • Universities: ✓ {len(universities)} loaded")
    print("\nFrontend fix applied:")
    print("  • Added loggedIn check to data fetch useEffect")
    print("  • Only fetch data AFTER successful login")
    print("  • Fixed handleLogin to only set loggedIn on success")

if __name__ == '__main__':
    test_admin_data_loading()
