#!/usr/bin/env python
"""
Test admin email workflow endpoints
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
from medical_cases.models import MedicalCase

def get_admin_token():
    """Get admin access token"""
    client = APIClient()
    payload = {
        'email': 'admin@example.com',
        'password': 'admin@123'
    }
    response = client.post('/api/login/', payload, format='json')
    if response.status_code == 200:
        return response.json().get('access')
    return None

def test_email_endpoints():
    """Test email workflow endpoints"""
    print("=" * 70)
    print("TEST: Email Workflow Endpoints")
    print("=" * 70)
    
    token = get_admin_token()
    if not token:
        print("Failed to get admin token")
        return
    
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    # Get available cases
    response = client.get('/api/medical-cases/')
    if response.status_code != 200:
        print("Failed to fetch cases")
        return
    
    cases = response.json()
    print(f"✓ Found {len(cases)} cases")
    
    if cases:
        case_id = cases[0]['id']
        print(f"\nTesting email endpoints for case ID: {case_id}")
        
        # Try to send hospital mail (might fail if case is not PENDING)
        try:
            case = MedicalCase.objects.get(id=case_id)
            print(f"  - Case status: {case.status}")
        except:
            pass
        
        # Test hospital mail endpoint
        print("\n  Testing hospital verification email endpoint...")
        response = client.post(f'/api/medical-cases/{case_id}/send-hospital-mail/')
        print(f"    Status: {response.status_code}")
        if response.status_code != 200:
            print(f"    Response: {response.json()}")
        else:
            print(f"    ✓ Success: {response.json()}")

if __name__ == '__main__':
    test_email_endpoints()
