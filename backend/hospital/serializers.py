from rest_framework import serializers
from .models import Hospital


class HospitalSerializer(serializers.ModelSerializer):
    is_trusted = serializers.SerializerMethodField()
    email = serializers.CharField(source='contact_email', read_only=True)
    phone = serializers.CharField(source='contact_phone', read_only=True)

    class Meta:
        model = Hospital
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'address',
            'is_trusted',
            'created_at',
            'registration_number',
            'state',
            'city',
            'website',
        ]
        read_only_fields = fields

    def get_is_trusted(self, obj):
        return obj.government_verified
