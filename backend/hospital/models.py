from django.db import models

# Create your models here.
from django.db import models

class Hospital(models.Model):

    name = models.CharField(max_length=255)

    registration_number = models.CharField(
        max_length=100,
        unique=True
    )

    government_verified = models.BooleanField(default=True)

    state = models.CharField(max_length=100)

    city = models.CharField(max_length=100)

    address = models.TextField()

    contact_email = models.EmailField(null=True, blank=True)

    contact_phone = models.CharField(max_length=15, null=True, blank=True)

    website = models.URLField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name