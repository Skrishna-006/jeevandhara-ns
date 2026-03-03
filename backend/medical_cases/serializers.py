from rest_framework import serializers
from .models import MedicalCase, MedicalDocument
from hospital.serializers import HospitalSerializer


class MedicalDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalDocument
        fields = ['id', 'file', 'document_type', 'uploaded_at', 'extracted_text']
        read_only_fields = ['uploaded_at', 'extracted_text']


class MedicalCaseSerializer(serializers.ModelSerializer):
    documents = MedicalDocumentSerializer(many=True, read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    ai_score = serializers.IntegerField(read_only=True)
    ai_credibility_score = serializers.IntegerField(read_only=True)
    ai_recommendation = serializers.CharField(read_only=True)
    ai_processing_status = serializers.CharField(read_only=True)
    # detailed_analysis intentionally omitted for normal users
    uploaded_files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = MedicalCase
        fields = [
            'id',
            'patient_full_name',
            'ai_credibility_score',
            'ai_recommendation',
            'ai_processing_status',
            'age',
            'gender',
            'contact_number',
            'address',
            'disease',
            'hospital',
            'hospital_name',
            'treating_doctor',
            'treatment_description',
            'estimated_cost',
            'required_funding',
            'annual_family_income',
            'family_members_count',
            'employment_status',
            'government_scheme_enrolled',
            'status',
            'ai_score',
            'documents',
            'uploaded_files',
            'hospital_mail_sent',
            'hospital_mail_sent_at',
            'university_mail_sent',
            'university_mail_sent_at',
            'hospital_reply_received',
            'hospital_reply_content',
            'hospital_reply_received_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['status', 'documents', 'created_at', 'updated_at', 'hospital_mail_sent', 'hospital_mail_sent_at', 'university_mail_sent', 'university_mail_sent_at', 'hospital_reply_received', 'hospital_reply_content', 'hospital_reply_received_at']

    def create(self, validated_data):
        # Extract uploaded files
        uploaded_files = validated_data.pop('uploaded_files', [])
        
        # Create medical case
        medical_case = MedicalCase.objects.create(**validated_data)
        
        # Save files
        for file in uploaded_files:
            MedicalDocument.objects.create(
                medical_case=medical_case,
                file=file,
                document_type="MEDICAL"
            )
        
        return medical_case
