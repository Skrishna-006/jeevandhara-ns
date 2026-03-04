from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_auth(request):
    """
    Debug endpoint to check authentication state
    """
    return Response({
        "authenticated": request.user.is_authenticated,
        "user_id": request.user.id if request.user.is_authenticated else None,
        "email": request.user.email if hasattr(request.user, 'email') else None,
        "username": request.user.username if hasattr(request.user, 'username') else None,
        "role": getattr(request.user, 'role', 'NOT SET'),
        "is_superuser": request.user.is_superuser if request.user.is_authenticated else None,
        "token_claims": {
            'role': getattr(request.user, 'role', None),
            'email': getattr(request.user, 'email', None),
        }
    })
