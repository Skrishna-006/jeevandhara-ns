from django.db import models
from django.conf import settings
from hospital.models import Hospital


class MedicalCase(models.Model):
    """Medical case registration by normal users."""
    
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("HOSPITAL_VERIFIED", "Hospital Verified"),
        ("FUNDED", "Funded"),
    ]
    
    GENDER_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
        ("Other", "Other"),
    ]

    EMPLOYMENT_CHOICES = [
        ("Salaried", "Salaried"),
        ("Self-employed", "Self-employed"),
        ("Daily wage", "Daily wage"),
        ("Unemployed", "Unemployed"),
        ("Retired", "Retired"),
    ]
    
    # User
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="medical_cases"
    )
    
    # Patient Details
    patient_full_name = models.CharField(max_length=255)
    age = models.IntegerField()
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES)
    contact_number = models.CharField(max_length=15)
    address = models.TextField()
    
    # Medical Details
    disease = models.CharField(max_length=255)
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True)
    treating_doctor = models.CharField(max_length=255)
    treatment_description = models.TextField()
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2)
    required_funding = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Financial Details
    annual_family_income = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    family_members_count = models.IntegerField(default=1)
    employment_status = models.CharField(max_length=20, choices=EMPLOYMENT_CHOICES, default="Unemployed")
    government_scheme_enrolled = models.BooleanField(default=False)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    # AI score (generated when case created)
    ai_score = models.IntegerField(default=0)

    # --- AI analysis fields ---
    ai_credibility_score = models.IntegerField(null=True, blank=True)
    ai_recommendation = models.CharField(max_length=20, null=True, blank=True)
    ai_confidence_level = models.CharField(max_length=20, null=True, blank=True)
    ai_summary = models.TextField(null=True, blank=True)
    ai_detailed_analysis = models.JSONField(null=True, blank=True)
    ai_verified_at = models.DateTimeField(null=True, blank=True)
    AI_STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PROCESSING", "Processing"),
        ("COMPLETED", "Completed"),
        ("FAILED", "Failed"),
    ]
    ai_processing_status = models.CharField(
        max_length=20,
        choices=AI_STATUS_CHOICES,
        default="PENDING",
    )

    # Email workflow tracking
    hospital_mail_sent = models.BooleanField(default=False)
    hospital_mail_sent_at = models.DateTimeField(null=True, blank=True)
    university_mail_sent = models.BooleanField(default=False)
    university_mail_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Hospital reply tracking
    hospital_reply_received = models.BooleanField(default=False)
    hospital_reply_content = models.TextField(blank=True, null=True)
    hospital_reply_received_at = models.DateTimeField(null=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_at"]
    
    def save(self, *args, **kwargs):
        # assign ai_score once when first saved if not already set
        if not self.ai_score:
            import random
            self.ai_score = random.randint(60, 95)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Medical Case - {self.patient_full_name} ({self.disease})"


class MedicalDocument(models.Model):
    """Documents uploaded for a medical case."""
    
    DOCUMENT_TYPE_CHOICES = [
        ("MEDICAL", "Medical Document"),
        ("FINANCIAL", "Financial Document"),
    ]
    
    medical_case = models.ForeignKey(
        MedicalCase,
        on_delete=models.CASCADE,
        related_name="documents"
    )
    file = models.FileField(upload_to="medical_documents/")
    document_type = models.CharField(
        max_length=20,
        choices=DOCUMENT_TYPE_CHOICES,
        default="MEDICAL"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    # text extracted via AI pipeline
    extracted_text = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.get_document_type_display()} - {self.medical_case.id}"
