"""
Quick setup script to create test users and run migrations
Run this after any git pull or major backend changes

Usage:
    cd backend
    python quick_setup.py
"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jeevandhara.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.core.management import call_command
from accounts.models import CustomUser
from django.contrib.auth import authenticate


def main():
    print("\n" + "="*60)
    print("  QUICK SETUP SCRIPT")
    print("="*60)
    
    # Step 1: Run migrations
    print("\n[1/4] Running migrations...")
    try:
        call_command('migrate', verbosity=0)
        print("✅ Migrations completed")
    except Exception as e:
        print(f"⚠️  Migrations: {e}")
    
    # Step 2: Fix user roles
    print("\n[2/4] Fixing missing user roles...")
    try:
        call_command('fix_user_roles', verbosity=0)
        print("✅ User roles fixed")
    except Exception as e:
        print(f"⚠️  Fix roles: {e}")
    
    # Step 3: Create admin if needed
    print("\n[3/4] Checking admin account...")
    admin = CustomUser.objects.filter(is_superuser=True).first()
    if admin:
        print(f"✅ Admin exists: {admin.email}")
    else:
        print("ℹ️  No admin found. Create one with:")
        print("   python manage.py createsuperuser")
    
    # Step 4: Create test users
    print("\n[4/4] Creating test users...")
    
    test_users = [
        {
            'email': 'normaluser@example.com',
            'password': 'Test@123',
            'role': 'NORMAL_USER',
            'description': 'Normal User'
        },
        {
            'email': 'hospital@example.com',
            'password': 'Test@123',
            'role': 'HOSPITAL',
            'description': 'Hospital User'
        },
        {
            'email': 'university@example.com',
            'password': 'Test@123',
            'role': 'UNIVERSITY',
            'description': 'University User'
        },
    ]
    
    for user_config in test_users:
        user, created = CustomUser.objects.get_or_create(
            email=user_config['email'],
            defaults={
                'role': user_config['role'],
                'is_active': True,
                'is_staff': False,
            }
        )
        
        if created:
            user.set_password(user_config['password'])
            user.save()
            print(f"✅ Created {user_config['description']}: {user.email}")
        else:
            # Update password and role
            user.set_password(user_config['password'])
            user.role = user_config['role']
            user.save()
            print(f"✅ Updated {user_config['description']}: {user.email}")
            
        # Verify work
        auth_user = authenticate(username=user.email, password=user_config['password'])
        if auth_user:
            print(f"   ✓ Can authenticate with password")
        else:
            print(f"   ❌ Authentication failed!")
    
    # Final summary
    print("\n" + "="*60)
    print("  SETUP COMPLETE")
    print("="*60)
    
    print("\nTest Users Created:")
    for user_config in test_users:
        print(f"  Email: {user_config['email']}")
        print(f"  Password: {user_config['password']}")
        print(f"  Role: {user_config['role']}")
        print()
    
    print("Next Steps:")
    print("1. Start the frontend: cd frontend && npm run dev")
    print("2. Go to http://localhost:5173/login")
    print("3. Login with one of the test users above")
    print("4. Check DevTools (F12) → Local Storage for tokens")
    print("5. Navigate to Dashboard and verify no errors")


if __name__ == '__main__':
    main()
