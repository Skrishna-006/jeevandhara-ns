"""
Email service for JeevanDhara medical case workflow.
Handles sending verification and funding request emails.
"""
import logging
from django.core.mail import send_mail
from django.utils import timezone
from django.conf import settings
from university.models import Universities
from .email_templates import (
    get_hospital_verification_email_html,
    get_university_funding_email_html
)

logger = logging.getLogger(__name__)


class EmailWorkflowError(Exception):
    """Custom exception for email workflow errors."""
    pass


def send_hospital_verification_email(medical_case):
    """
    Send hospital verification email to the hospital contact.
    
    Args:
        medical_case: MedicalCase instance
        
    Raises:
        EmailWorkflowError: If email sending fails
        
    Returns:
        dict: Success/failure response
    """
    try:
        # Validate case status
        if medical_case.status != "PENDING":
            raise EmailWorkflowError(
                f"Case must be in PENDING status. Current status: {medical_case.status}"
            )
        
        # Check if hospital exists and has email
        if not medical_case.hospital:
            raise EmailWorkflowError("Medical case does not have an associated hospital")
        
        hospital_email = medical_case.hospital.contact_email
        if not hospital_email:
            raise EmailWorkflowError(
                f"Hospital '{medical_case.hospital.name}' does not have a contact email"
            )
        
        # Generate email content
        subject = f"Medical Case Verification Required - {medical_case.patient_full_name}"
        html_message = get_hospital_verification_email_html(medical_case)
        
        # Send email
        send_mail(
            subject=subject,
            message=f"Case ID: {medical_case.id} - {medical_case.patient_full_name}",  # Fallback plain text
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[hospital_email],
            html_message=html_message,
            fail_silently=False,
        )
        
        # Update medical case
        medical_case.hospital_mail_sent = True
        medical_case.hospital_mail_sent_at = timezone.now()
        medical_case.save(update_fields=['hospital_mail_sent', 'hospital_mail_sent_at'])
        
        logger.info(
            f"Hospital verification email sent successfully to {hospital_email} for case {medical_case.id}"
        )
        
        return {
            "success": True,
            "message": f"Verification email sent to {hospital_email}",
            "case_id": medical_case.id,
            "hospital_email": hospital_email,
            "sent_at": medical_case.hospital_mail_sent_at.isoformat()
        }
    
    except EmailWorkflowError as e:
        error_message = str(e)
        logger.error(f"Email workflow error for case {medical_case.id}: {error_message}")
        raise
    
    except Exception as e:
        error_message = f"Failed to send hospital verification email: {str(e)}"
        logger.error(f"Unexpected error for case {medical_case.id}: {error_message}")
        raise EmailWorkflowError(error_message)


def send_university_funding_email(medical_case):
    """
    Send funding request email to all active universities.
    
    Args:
        medical_case: MedicalCase instance
        
    Raises:
        EmailWorkflowError: If email sending fails or no universities found
        
    Returns:
        dict: Success/failure response with details
    """
    try:
        # Validate case status
        if medical_case.status != "HOSPITAL_VERIFIED":
            raise EmailWorkflowError(
                f"Case must be in HOSPITAL_VERIFIED status. Current status: {medical_case.status}"
            )
        
        # Check if hospital verification email was sent
        if not medical_case.hospital_mail_sent:
            raise EmailWorkflowError(
                "Hospital verification email must be sent before sending university funding emails"
            )
        
        # Fetch all active universities
        universities = Universities.objects.filter(is_suspended=False)
        
        if not universities.exists():
            raise EmailWorkflowError("No active universities found in the system")
        
        # Collect university emails
        university_emails = [uni.official_email for uni in universities if uni.official_email]
        
        if not university_emails:
            raise EmailWorkflowError("No valid email addresses found for universities")
        
        # Generate email content
        subject = f"Funding Request: Medical Case ID {medical_case.id} - {medical_case.patient_full_name}"
        html_message = get_university_funding_email_html(medical_case)
        
        # Send emails to all universities
        sent_count = send_mail(
            subject=subject,
            message=f"Case ID: {medical_case.id} - {medical_case.patient_full_name}",  # Fallback plain text
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=university_emails,
            html_message=html_message,
            fail_silently=False,
        )
        
        if sent_count == 0:
            raise EmailWorkflowError("Failed to send emails - no recipients received the message")
        
        # Update medical case
        medical_case.university_mail_sent = True
        medical_case.university_mail_sent_at = timezone.now()
        medical_case.save(update_fields=['university_mail_sent', 'university_mail_sent_at'])
        
        logger.info(
            f"University funding emails sent successfully for case {medical_case.id} to {len(university_emails)} universities"
        )
        
        return {
            "success": True,
            "message": f"Funding request emails sent to {len(university_emails)} universities",
            "case_id": medical_case.id,
            "universities_count": len(university_emails),
            "university_emails": university_emails,
            "sent_at": medical_case.university_mail_sent_at.isoformat()
        }
    
    except EmailWorkflowError as e:
        error_message = str(e)
        logger.error(f"Email workflow error for case {medical_case.id}: {error_message}")
        raise
    
    except Exception as e:
        error_message = f"Failed to send university funding emails: {str(e)}"
        logger.error(f"Unexpected error for case {medical_case.id}: {error_message}")
        raise EmailWorkflowError(error_message)
