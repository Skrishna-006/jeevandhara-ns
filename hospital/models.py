from django.db import models

# Create your models here.
class HospitalInfo(models.Model):
    user=models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='hospital_info')
    hospital_name = models.CharField(max_length=255)
    hospital_registration_number = models.CharField(max_length=255)
    official_email = models.EmailField()
    official_phone_number = models.CharField(max_length=20)
    address = models.TextField()
    registration_certificate_file = models.FileField(upload_to='hospital_certificates/')
    verification_status = models.CharField(max_length=20, default='pending')
    is_verified_by_admin = models.BooleanField(default=False)
    is_suspended = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey('accounts.User', null=True, blank=True, on_delete=models.SET_NULL, related_name='approved_hospitals')
    rejected_at = models.DateTimeField(null=True, blank=True)