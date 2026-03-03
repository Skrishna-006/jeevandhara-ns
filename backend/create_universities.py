import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jeevandhara.settings')
django.setup()

from university.models import Universities

# create some sample universities
universities = [
    {
        "university_name": "National Institute of Technology, Trichy",
        "official_email": "info@nitt.edu",
        "address": "NH 45, Tiruchirappalli, Tamil Nadu",
        "is_suspended": False,
    },
    {
        "university_name": "Indian Institute of Science, Bangalore",
        "official_email": "contact@iisc.ac.in",
        "address": "Bangalore, Karnataka",
        "is_suspended": False,
    },
    {
        "university_name": "Delhi University",
        "official_email": "du.admissions@du.ac.in",
        "address": "New Delhi, Delhi",
        "is_suspended": False,
    },
]

for uni_data in universities:
    uni, created = Universities.objects.get_or_create(
        official_email=uni_data["official_email"],
        defaults={
            "university_name": uni_data["university_name"],
            "address": uni_data["address"],
            "is_suspended": uni_data["is_suspended"],
        }
    )
    if created:
        print(f"✓ Created: {uni.university_name} ({uni.official_email})")
    else:
        print(f"~ Already exists: {uni.university_name} ({uni.official_email})")

print("\n✓ All universities processed successfully!")
