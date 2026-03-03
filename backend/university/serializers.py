from rest_framework import serializers
from .models import Universities


class UniversitiesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Universities
        fields = [
            "id",
            "university_name",
            "official_email",
            "address",
            "is_suspended",
            "created_at",
            "approved_at",
        ]
        read_only_fields = ["id", "created_at", "approved_at"]
