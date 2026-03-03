#!/usr/bin/env python
import os
import sys
import django
import json
import urllib.request

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jeevandhara.settings')
sys.path.insert(0, r'D:\curetrust\backend')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# Create test user
user, created = User.objects.get_or_create(
    username='testuser_hospital_api',
    defaults={'email': 'testuser_api@hospitals.com'}
)
if created:
    user.set_password('test123')
    user.save()
    print(f"✓ Created test user: {user.username}")
else:
    print(f"✓ Using existing user: {user.username}")

# Generate token
refresh = RefreshToken.for_user(user)
access_token = str(refresh.access_token)
print(f"✓ Generated access token")

# Test hospitals endpoint
print(f"\nTesting: GET /api/hospitals/")
url = 'http://localhost:8000/api/hospitals/'
req = urllib.request.Request(url)
req.add_header('Authorization', f'Bearer {access_token}')

try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print(f"✓ Status: {response.status}")
        print(f"✓ Hospitals retrieved: {len(data)} hospitals")
        if data:
            print(f"✓ Sample Hospital: {data[0]['name']}")
            print(f"\n✅ API WORKING! Hospitals endpoint is functional.")
except Exception as e:
    print(f"✗ Error: {type(e).__name__}")
    print(f"✗ Details: {str(e)[:300]}")
    print(f"\n❌ API NOT RESPONDING. Check if backend server is running on port 8000")
