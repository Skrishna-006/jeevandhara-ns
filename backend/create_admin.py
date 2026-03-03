#!/usr/bin/env python
"""
Script to create/update admin superuser for JeevanDhara
Run this from the backend directory: python create_admin.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, '/d:/curetrust/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jeevandhara.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

User = get_user_model()

# Create or update admin superuser
admin_data = {
    'username': 'admin',
    'email': 'admin@example.com',
    'password': 'admin@123',
}

# Check if admin exists
admin_user = User.objects.filter(username=admin_data['username']).first()
if not admin_user:
    admin_user = User.objects.filter(email=admin_data['email']).first()

if admin_user:
    print(f"[UPDATE] Admin user found (username: {admin_user.username}, email: {admin_user.email})")
    admin_user.username = admin_data['username']
    admin_user.email = admin_data['email']
    admin_user.set_password(admin_data['password'])
    admin_user.is_superuser = True
    admin_user.is_staff = True
    admin_user.save()
    print(f"[SUCCESS] Updated admin user with new credentials")
else:
    print(f"[CREATE] Creating admin superuser '{admin_data['username']}'...")
    admin_user = User.objects.create_superuser(
        username=admin_data['username'],
        email=admin_data['email'],
        password=admin_data['password']
    )
    print(f"[SUCCESS] Admin superuser created!")

print(f"\nAdmin Credentials:")
print(f"  Username: {admin_data['username']}")
print(f"  Email: {admin_data['email']}")
print(f"  Password: {admin_data['password']}")
print(f"  Is Superuser: {admin_user.is_superuser}")
print(f"  Is Staff: {admin_user.is_staff}")
