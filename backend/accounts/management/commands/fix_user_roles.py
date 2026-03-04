"""
Fix missing roles for users in the database.
Run this to ensure all users have a role set.
"""
from django.core.management.base import BaseCommand
from accounts.models import CustomUser, ApprovedUniversityEmail


class Command(BaseCommand):
    help = 'Fix missing roles for users in the database'

    def handle(self, *args, **options):
        # Find all users without a role
        users_without_role = CustomUser.objects.filter(role__isnull=True)
        
        self.stdout.write(f"Found {users_without_role.count()} users without a role")
        
        fixed_count = 0
        for user in users_without_role:
            # Determine role
            if user.is_superuser:
                # Skip admin users - they use is_superuser flag
                continue
            elif ApprovedUniversityEmail.objects.filter(email=user.email).exists():
                user.role = "UNIVERSITY"
            else:
                user.role = "NORMAL_USER"
            
            user.save()
            fixed_count += 1
            self.stdout.write(f"✓ Fixed {user.email} -> role={user.role}")
        
        self.stdout.write(self.style.SUCCESS(f"\n✓ Fixed {fixed_count} users successfully"))
