#!/usr/bin/env python
"""
Test hospital mail sending functionality with console backend.
Emails will be printed to console instead of sent via SMTP.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jeevandhara.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from medical_cases.models import MedicalCase
from medical_cases.services import send_hospital_verification_email, EmailWorkflowError
from hospital.models import Hospital
from accounts.models import CustomUser

def test_hospital_email():
    print("=" * 70)
    print("TEST: Hospital Mail Sending (Console Backend)")
    print("=" * 70)
    
    # Check if there are any PENDING cases
    pending_cases = MedicalCase.objects.filter(status="PENDING")
    
    if not pending_cases.exists():
        print("\n❌ No PENDING cases found. Creating test case...")
        
        # Get or create a hospital
        hospital, created = Hospital.objects.get_or_create(
            name="Test Hospital",
            defaults={
                "city": "Delhi",
                "contact_email": "hospital@example.com",
                "phone": "+91-11-12345678",
                "status": "approved"
            }
        )
        if created:
            print(f"   ✓ Created test hospital: {hospital.name}")
        else:
            print(f"   ✓ Using existing hospital: {hospital.name}")
        
        # Get or create a user
        user, created = CustomUser.objects.get_or_create(
            email="testuser@example.com",
            defaults={
                "userType": "user",
                "full_name": "Test User"
            }
        )
        if created:
            print(f"   ✓ Created test user: {user.email}")
        else:
            print(f"   ✓ Using existing user: {user.email}")
        
        # Create a medical case
        medical_case = MedicalCase.objects.create(
            patient_full_name="Test Patient",
            disease="Test Disease",
            hospital=hospital,
            user=user,
            required_funding=100000,
            estimated_cost=100000,
            status="PENDING",
            hospital_registration_no="REG-123",
            patient_phone="+91-9999999999",
            patient_email="patient@example.com",
            doctor_name="Dr. Test",
            doctor_contact="+91-8888888888",
        )
        print(f"   ✓ Created test case: {medical_case.id}")
        pending_cases = [medical_case]
    
    # Test sending email for the first pending case
    case = pending_cases.first()
    print(f"\n📧 Sending hospital verification email for Case ID: {case.id}")
    print(f"   Patient: {case.patient_full_name}")
    print(f"   Hospital: {case.hospital.name}")
    print(f"   Hospital Email: {case.hospital.contact_email}")
    print(f"   Status: {case.status}\n")
    
    try:
        result = send_hospital_verification_email(case)
        print("✅ Hospital Email Sent Successfully!")
        print(f"   Message: {result['message']}")
        print(f"   Case ID: {result['case_id']}")
        print(f"   Hospital Email: {result['hospital_email']}")
        print(f"   Sent At: {result['sent_at']}")
        
        # Verify case was updated
        case.refresh_from_db()
        print(f"\n✓ Case updated:")
        print(f"   hospital_mail_sent: {case.hospital_mail_sent}")
        print(f"   hospital_mail_sent_at: {case.hospital_mail_sent_at}")
        
    except EmailWorkflowError as e:
        print(f"❌ Email Workflow Error: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Unexpected Error: {str(e)}")
        return False
    
    print("\n" + "=" * 70)
    print("✅ TEST PASSED - Hospital email sending works!")
    print("=" * 70)
    print("\n📝 Note: With console backend, emails are printed to stdout.")
    print("   Look above for the full email content sent to the hospital.")
    print("\n🔧 For production, configure Gmail app password in .env file:")
    print("   EMAIL_HOST_USER=your-email@gmail.com")
    print("   EMAIL_HOST_PASSWORD=your-app-password")
    print("=" * 70)
    
    return True

if __name__ == "__main__":
    success = test_hospital_email()
    sys.exit(0 if success else 1)
