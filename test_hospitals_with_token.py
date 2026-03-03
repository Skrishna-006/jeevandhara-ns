import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jeevandhara.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
import json
import urllib.request

User = get_user_model()

# Create or get a test user
username = 'testuser_hospitals'
email = 'testuser@hospitals.com'
user, created = User.objects.get_or_create(
    username=username,
    defaults={'email': email}
)

if created:
    user.set_password('testpass123')
    user.save()
    print(f"Created test user: {username}")
else:
    print(f"Using existing user: {username}")

# Generate JWT token
refresh = RefreshToken.for_user(user)
access_token = str(refresh.access_token)

print(f"Access Token: {access_token[:50]}...")
print(f"\nTesting /api/hospitals/ endpoint...")

# Test the hospitals endpoint
url = 'http://localhost:8000/api/hospitals/'
req = urllib.request.Request(url)
req.add_header('Authorization', f'Bearer {access_token}')

try:
    with urllib.request.urlopen(req) as response:
        print(f'✓ Status Code: {response.status}')
        data = json.loads(response.read().decode())
        print(f'✓ Response: {json.dumps(data, indent=2)[:500]}')
        print(f"\n✓ API is working! Retrieved {len(data)} hospitals")
except Exception as e:
    print(f'✗ Error: {type(e).__name__} - {str(e)[:200]}')
