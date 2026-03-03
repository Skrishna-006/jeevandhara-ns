from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Universities
from .serializers import UniversitiesSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def university_list(request):
    """
    Return list of active (not suspended) universities.
    Only authenticated users may access this endpoint.
    """
    qs = Universities.objects.filter(is_suspended=False).order_by("-created_at")
    serializer = UniversitiesSerializer(qs, many=True)
    return Response(serializer.data)
