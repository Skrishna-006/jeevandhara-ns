from rest_framework import serializers
from .models import *
class HospitalInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalInfo
        fields = ['user', 'hospital_name', 'hospital_registration_number', 'official_email', 'official_phone_number', 'address', 'registration_certificate_file']
    def create(self, validated_data):
        hospitalinfo=HospitalInfo.objects.create(
            user=validated_data['user'],
            hospital_name=validated_data['hospital_name'],
            hospital_registration_number=validated_data['hospital_registration_number'],    
            official_email=validated_data['official_email'],
            official_phone_number=validated_data['official_phone_number'],  
            address=validated_data['address'],
            registration_certificate_file=validated_data['registration_certificate_file'],)
        return hospitalinfo
        
