from django.db import models

# Create your models here.
class MedicalCase(models.Model):
    #patient identity fields
    patient_name = models.CharField(max_length=100)
    patient_date_of_birth = models.DateField()
    aadhar_number = models.CharField(max_length=12, unique=True)
    # medical details fields
    disease_name = models.CharField(max_length=100)
    diagnosis_date = models.DateField()
    doctor_registration_number = models.CharField(max_length=100)
    #financial details fields   
    estimated_total_Cost= models.DecimalField(max_digits=10, decimal_places=2)
    amount_required= models.DecimalField(max_digits=10, decimal_places=2)
    insurance_available = models.BooleanField(default=False)
    insurance_coverage=models.DecimalField
    
    #documents 
    prescription_document = models.FileField(upload_to='prescriptions/')
    medical_report_document = models.FileField(upload_to='medical_reports/')
    #system fields
    status = models.CharField(max_length=20, default='Pending')
    ai_risk_score= models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    duplicate_case = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)