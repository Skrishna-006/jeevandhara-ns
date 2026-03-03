import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jeevandhara.settings')
django.setup()

from hospital.models import Hospital

# Create three hospitals
hospitals = [
    {
        "name": "Apollo Hospital",
        "registration_number": "APL-001",
        "contact_email": "contact@apollohospital.com",
        "contact_phone": "9876543210",
        "address": "123 Medical Lane, New Delhi",
        "city": "Delhi",
        "state": "Delhi",
        "website": "https://www.apollohospitals.com",
        "government_verified": True
    },
    {
        "name": "Fortis Healthcare",
        "registration_number": "FRT-002",
        "contact_email": "info@fortishealthcare.com",
        "contact_phone": "9876543211",
        "address": "456 Health Street, Mumbai",
        "city": "Mumbai",
        "state": "Maharashtra",
        "website": "https://www.fortishealthcare.com",
        "government_verified": True
    },
    {
        "name": "Max Healthcare",
        "registration_number": "MAX-003",
        "contact_email": "support@maxhealthcare.com",
        "contact_phone": "9876543212",
        "address": "789 Care Boulevard, Bangalore",
        "city": "Bangalore",
        "state": "Karnataka",
        "website": "https://www.maxhealthcare.in",
        "government_verified": True
    },
]

for hospital_data in hospitals:
    hospital, created = Hospital.objects.get_or_create(
        registration_number=hospital_data["registration_number"],
        defaults={
            "name": hospital_data["name"],
            "contact_email": hospital_data["contact_email"],
            "contact_phone": hospital_data["contact_phone"],
            "address": hospital_data["address"],
            "city": hospital_data["city"],
            "state": hospital_data["state"],
            "website": hospital_data["website"],
            "government_verified": hospital_data["government_verified"]
        }
    )
    if created:
        print(f"✓ Created: {hospital.name} ({hospital.registration_number})")
    else:
        print(f"~ Already exists: {hospital.name} ({hospital.registration_number})")

print("\n✓ All hospitals processed successfully!")

