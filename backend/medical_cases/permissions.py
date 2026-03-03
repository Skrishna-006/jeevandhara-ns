from rest_framework.permissions import BasePermission


class IsNormalUser(BasePermission):
    """
    Allow only users with role NORMAL_USER.
    Deny ADMIN and UNIVERSITY users.
    """
    
    def has_permission(self, request, view):
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Get user role from token/request
        user_role = getattr(request.user, 'role', None)
        
        # Allow only NORMAL_USER
        return user_role == 'NORMAL_USER'
