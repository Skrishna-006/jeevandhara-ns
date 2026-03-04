from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from rest_framework import exceptions
import logging

logger = logging.getLogger(__name__)


class CustomJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that properly loads user role from database.
    Uses the standard JWT validation from parent class without modification.
    """
    
    def authenticate(self, request):
        """
        Authenticate using standard JWT validation, then load role from DB.
        """
        try:
            # Use parent class for standard JWT validation
            result = super().authenticate(request)
            
            if result is None:
                return None
                
            user, validated_token = result
            
            # Now load the user's role from the database
            # This ensures the role is always current and not stale from token
            if user and user.is_authenticated:
                # Force reload user from database to get current role
                user.refresh_from_db()
                # Ensure role attribute is available
                if not hasattr(user, 'role'):
                    user.role = 'user'
                logger.debug(f"[JWT] User {user.email} authenticated with DB role: {user.role}")
            
            return user, validated_token
            
        except InvalidToken as e:
            logger.error(f"[JWT] InvalidToken error: {str(e)}")
            raise
        except AuthenticationFailed as e:
            logger.error(f"[JWT] AuthenticationFailed error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"[JWT] Unexpected error during authentication: {str(e)}", exc_info=True)
            raise AuthenticationFailed("Authentication failed")
