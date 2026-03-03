from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import MedicalCase, MedicalDocument
from .serializers import MedicalCaseSerializer
from .permissions import IsNormalUser

# ai integration
from jeevandhara_ai.services import run_ai_analysis_for_case

# email services
from .services import (
    send_hospital_verification_email,
    send_university_funding_email,
    EmailWorkflowError
)



@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def medical_cases(request):
    """
    GET  -> list all cases (admin only)
    POST -> create a new medical case (NORMAL_USER only).
    When a case is created we immediately invoke the AI analysis service
    synchronously and return its score/recommendation in the response.
    """
    if request.method == 'GET':
        if not request.user.is_superuser:
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        cases = MedicalCase.objects.all().order_by('-created_at')
        serializer = MedicalCaseSerializer(cases, many=True)
        return Response(serializer.data)

    # POST path
    if not request.user.is_authenticated or getattr(request.user, 'role', '') != 'NORMAL_USER':
        return Response({'detail': 'Only normal users can submit cases'}, status=status.HTTP_403_FORBIDDEN)

    data = request.data.copy()
    data['user'] = request.user.id

    # basic numeric validation
    try:
        estimated_cost = float(data.get('estimated_cost', 0))
        required_funding = float(data.get('required_funding', 0))
        if required_funding > estimated_cost:
            return Response({"error": "Required funding cannot exceed estimated cost"}, status=status.HTTP_400_BAD_REQUEST)
    except ValueError:
        return Response({"error": "Invalid cost values"}, status=status.HTTP_400_BAD_REQUEST)

    files = request.FILES.getlist('uploaded_files')
    file_types = request.POST.getlist('file_types')
    if not files:
        return Response({"error": "At least 1 medical document and 1 financial document are required"}, status=status.HTTP_400_BAD_REQUEST)

    medical_count = sum(1 for ft in file_types if ft == 'MEDICAL')
    financial_count = sum(1 for ft in file_types if ft == 'FINANCIAL')
    if medical_count == 0:
        return Response({"error": "At least 1 medical document is required"}, status=status.HTTP_400_BAD_REQUEST)
    if financial_count == 0:
        return Response({"error": "At least 1 financial document is required"}, status=status.HTTP_400_BAD_REQUEST)

    serializer = MedicalCaseSerializer(data=data)
    if serializer.is_valid():
        serializer.validated_data['uploaded_files'] = files
        medical_case = serializer.save(user=request.user)
        for i, file in enumerate(files):
            doc_type = file_types[i] if i < len(file_types) else "MEDICAL"
            MedicalDocument.objects.create(medical_case=medical_case, file=file, document_type=doc_type)

        # run the AI analysis synchronously
        run_ai_analysis_for_case(medical_case.id)
        return Response({
            "case_id": medical_case.id,
            "ai_score": medical_case.ai_credibility_score,
            "ai_recommendation": medical_case.ai_recommendation,
            "processing_status": medical_case.ai_processing_status,
            "message": "Case submitted and analyzed successfully",
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_medical_cases(request):
    """
    Get all medical cases belonging to the logged-in user.
    Only NORMAL_USER can access.
    """
    if not getattr(request.user, 'role', '') == 'NORMAL_USER':
        return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    cases = MedicalCase.objects.filter(user=request.user)
    serializer = MedicalCaseSerializer(cases, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def medical_case_detail(request, case_id):
    """
    Retrieve a single medical case by id (admin only)
    """
    if not request.user.is_superuser:
        return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    try:
        case = MedicalCase.objects.get(id=case_id)
    except MedicalCase.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = MedicalCaseSerializer(case)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def medical_case_analysis(request, case_id):
    """Return detailed AI analysis. ADMIN or UNIVERSITY only"""
    role = getattr(request.user, 'role', '')
    if not (request.user.is_superuser or role == 'UNIVERSITY'):
        return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    try:
        case = MedicalCase.objects.get(id=case_id)
    except MedicalCase.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    data = {
        'ai_detailed_analysis': case.ai_detailed_analysis,
        'credibility_score': case.ai_credibility_score,
        'recommendation': case.ai_recommendation,
        'summary': case.ai_summary,
        'confidence_level': case.ai_confidence_level,
        'processing_status': case.ai_processing_status,
    }
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_hospital_mail(request, case_id):
    """
    Send hospital verification email for a PENDING case.
    Only ADMIN role allowed.
    
    Endpoint: POST /api/medical-cases/<id>/send-hospital-mail/
    """
    # Check admin authorization
    if not request.user.is_superuser:
        return Response(
            {'detail': 'Only admins can send hospital verification emails'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        case = MedicalCase.objects.get(id=case_id)
    except MedicalCase.DoesNotExist:
        return Response({'detail': 'Case not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Validate case status
    if case.status != "PENDING":
        return Response(
            {'detail': f'Case must be in PENDING status. Current status: {case.status}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        result = send_hospital_verification_email(case)
        return Response(result, status=status.HTTP_200_OK)
    
    except EmailWorkflowError as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    except Exception as e:
        return Response(
            {'detail': f'Failed to send email: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_university_mail(request, case_id):
    """
    Send university funding request email for a HOSPITAL_VERIFIED case.
    Only ADMIN role allowed.
    
    Endpoint: POST /api/medical-cases/<id>/send-university-mail/
    """
    # Check admin authorization
    if not request.user.is_superuser:
        return Response(
            {'detail': 'Only admins can send university funding emails'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        case = MedicalCase.objects.get(id=case_id)
    except MedicalCase.DoesNotExist:
        return Response({'detail': 'Case not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Validate case status
    if case.status != "HOSPITAL_VERIFIED":
        return Response(
            {'detail': f'Case must be in HOSPITAL_VERIFIED status. Current status: {case.status}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if hospital mail was sent
    if not case.hospital_mail_sent:
        return Response(
            {'detail': 'Hospital verification email must be sent first'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        result = send_university_funding_email(case)
        return Response(result, status=status.HTTP_200_OK)
    
    except EmailWorkflowError as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    except Exception as e:
        return Response(
            {'detail': f'Failed to send emails: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )