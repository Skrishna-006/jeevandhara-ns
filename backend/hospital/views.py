from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Hospital
from .serializers import HospitalSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hospital_list(request):
    """
    List all trusted hospitals (government_verified=True).
    Only authenticated users can access.
    """
    hospitals = Hospital.objects.filter(government_verified=True).order_by('-created_at')
    serializer = HospitalSerializer(hospitals, many=True)
    return Response(serializer.data)
