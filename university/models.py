from django.db import models

# Create your models here.
class university(models.Model):
    user=models.OneToOneField('accounts.User', on_delete=models.CASCADE, related_name='university_info')
    university_name = models.CharField(max_length=255)
    university_registration_number = models.CharField(max_length=255)
    official_email = models.EmailField()
    official_phone_number = models.CharField(max_length=20)
    address = models.TextField()
    registration_certificate_file = models.FileField(upload_to='university_certificates/')
    verification_status = models.CharField(max_length=20, default='pending')
    is_suspended = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey('accounts.User', null=True, blank=True, on_delete=models.SET_NULL, related_name='approved_universities')
    rejected_at = models.DateTimeField(null=True, blank=True)