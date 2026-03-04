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
        
        # Get user role from either:
        # 1. JWT token claims (for API access)
        # 2. User model attribute (for session-based access)
        user_role = None
        
        # Try to get role from JWT claims first
        if hasattr(request, 'auth') and request.auth:
            try:
                user_role = request.auth.get('role') if hasattr(request.auth, 'get') else None
            except:
                pass
        
        # Fall back to user model attribute
        if not user_role:
            user_role = getattr(request.user, 'role', None)
        
        # Allow only NORMAL_USER
        return user_role == 'NORMAL_USER'
