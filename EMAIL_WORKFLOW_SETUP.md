# Email Workflow Setup Guide

## Admin Email Workflow System - Complete Implementation Guide

This document outlines the complete setup for the Admin Email Workflow system in JeevanDhara.

---

## 1. Overview

The admin email workflow system includes:

- **Hospital Verification Emails**: Sent to hospitals for case verification (for PENDING cases)
- **University Funding Emails**: Sent to universities to request funding (for HOSPITAL_VERIFIED cases)
- **Professional HTML Email Templates**: Beautiful, responsive email templates
- **Status Tracking**: Track which emails have been sent and when
- **Admin Dashboard UI**: Dedicated Mail Management section in the admin panel

---

## 2. Database Setup (Already Done)

The following migrations have been applied:

- Added `hospital_mail_sent` (BooleanField) to MedicalCase
- Added `hospital_mail_sent_at` (DateTimeField) to MedicalCase
- Added `university_mail_sent` (BooleanField) to MedicalCase
- Added `university_mail_sent_at` (DateTimeField) to MedicalCase

If not yet applied, run:

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

---

## 3. SMTP Configuration

### Step 3.1: Create `.env` File

Create a `.env` file in the project root directory (`d:\curetrust\.env`):

```
# ====== SMTP Configuration ======
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-app-specific-password
DEFAULT_FROM_EMAIL=your-gmail@gmail.com
```

### Step 3.2: Gmail Setup (if using Gmail)

If using Gmail, follow these steps:

1. **Enable 2FA** on your Google Account
2. **Generate App Password**:
   - Go to https://apppasswords.google.com
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password
   - Use this password as `EMAIL_HOST_PASSWORD`

### Step 3.3: Alternative Email Providers

#### SendGrid:

```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=SG.xxxxx-your-sendgrid-api-key
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

#### AWS SES:

```
EMAIL_HOST=email-smtp.region.amazonaws.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-smtp-username
EMAIL_HOST_PASSWORD=your-smtp-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

---

## 4. Backend Configuration (Already Done)

The following have been added to `backend/jeevandhara/settings.py`:

```python
# EMAIL CONFIGURATION
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True") == "True"
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", EMAIL_HOST_USER)
```

---

## 5. API Endpoints

### Endpoint 1: Send Hospital Verification Email

**URL**: `POST /api/medical-cases/<case_id>/send-hospital-mail/`

**Authorization**: Bearer token (ADMIN only)

**Conditions**:

- Case status must be `PENDING`
- Hospital must have a valid email address

**Request**:

```bash
curl -X POST http://localhost:8000/api/medical-cases/1/send-hospital-mail/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Success Response (200)**:

```json
{
  "success": true,
  "message": "Verification email sent to hospital@example.com",
  "case_id": 1,
  "hospital_email": "hospital@example.com",
  "sent_at": "2026-03-03T10:30:00Z"
}
```

**Error Responses**:

- `403 Forbidden`: User is not admin
- `400 Bad Request`: Case not in PENDING status or hospital has no email
- `404 Not Found`: Case not found
- `500 Internal Server Error`: Email sending failed

---

### Endpoint 2: Send University Funding Emails

**URL**: `POST /api/medical-cases/<case_id>/send-university-mail/`

**Authorization**: Bearer token (ADMIN only)

**Conditions**:

- Case status must be `HOSPITAL_VERIFIED`
- Hospital verification email must have been sent (`hospital_mail_sent = True`)
- At least one university with valid email must exist and not be suspended

**Request**:

```bash
curl -X POST http://localhost:8000/api/medical-cases/1/send-university-mail/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

**Success Response (200)**:

```json
{
  "success": true,
  "message": "Funding request emails sent to 3 universities",
  "case_id": 1,
  "universities_count": 3,
  "university_emails": [
    "university1@edu.com",
    "university2@edu.com",
    "university3@edu.com"
  ],
  "sent_at": "2026-03-03T11:30:00Z"
}
```

**Error Responses**:

- `403 Forbidden`: User is not admin
- `400 Bad Request`: Case not in correct status, hospital mail not sent, or no universities found
- `404 Not Found`: Case not found
- `500 Internal Server Error`: Email sending failed

---

## 6. Admin Panel Usage

### Accessing Mail Management

1. **Login to Admin Dashboard**:
   - URL: `http://localhost:3000/admin` (or your frontend URL)
   - Admin ID: `ADM-001`
   - Password: `admin@123`

2. **Navigate to Mail Management**:
   - Click the "📧 Mail Management" tab in the sidebar

3. **Mail Management Table**:

   The table displays all medical cases with columns:
   - **Case ID**: Unique identifier
   - **Patient Name**: Full name of the patient
   - **Hospital**: Associated hospital name
   - **Status**: Current case status (PENDING, HOSPITAL_VERIFIED, FUNDED)
   - **AI Score**: Credibility score from AI analysis
   - **Hospital Mail**: Shows if hospital verification email was sent
   - **University Mail**: Shows if university funding emails were sent
   - **Actions**: Buttons to trigger email sending

### Workflow

#### For PENDING Cases:

- Button: "Send Verification Mail to Hospital"
- **Action**: Sends professional HTML email to hospital contact
- **Content**: Patient details, medical info, financial summary, AI credibility assessment
- **Result**: `hospital_mail_sent` marked as True, timestamp recorded

#### For HOSPITAL_VERIFIED Cases (after hospital confirms):

- Button: "Send Funding Mail to Universities" (only if hospital mail was sent)
- **Action**: Sends emails to all active, non-suspended universities
- **Content**: AI score, recommendation, case summary, hospital verification status
- **Result**: `university_mail_sent` marked as True, timestamp recorded

#### Once Both Emails Sent:

- Badge: "✓ All mails sent"
- No further action available

---

## 7. Email Template Content

### Hospital Verification Email

**Subject**: "Medical Case Verification Required - [Patient Name]"

**Includes**:

- Professional header with branding
- Patient information (name, age, gender, contact)
- Medical details (disease, hospital, doctor, treatment)
- Financial summary (cost, funding required, family income)
- AI credibility assessment (score, recommendation, confidence level)
- Action note requesting verification
- Professional signature block

### University Funding Email

**Subject**: "Funding Request: Medical Case ID [ID] - [Patient Name]"

**Includes**:

- Professional header with branding
- Case overview (ID, patient, disease, hospital)
- Patient information (employment, income, family size)
- Medical & financial details
- AI verification status with score badge
- Hospital verification confirmation
- Call to action for funding participation
- Professional signature block

---

## 8. Error Handling & Logging

### Logging

All email operations are logged to the Django logger. View logs via:

```bash
# Production: Check your log files
# Development: Check Django console output
```

### Common Errors & Solutions

| Error                                    | Cause                                      | Solution                                              |
| ---------------------------------------- | ------------------------------------------ | ----------------------------------------------------- |
| "No module named 'dotenv'"               | Missing python-dotenv package              | `pip install python-dotenv`                           |
| "SMTP authentication failed"             | Invalid email credentials                  | Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD in .env |
| "Hospital does not have a contact email" | Hospital record missing email              | Update hospital record with contact email in admin    |
| "No active universities found"           | No universities in system or all suspended | Add universities and mark as not suspended            |
| "Failed to send email"                   | SMTP connection error                      | Check SMTP server, port, and TLS settings             |

---

## 9. Security Considerations

1. **Never commit .env file** to version control
2. **Use environment variables** for all sensitive data
3. **Restrict API access** to admin users only (implemented with `is_superuser` check)
4. **Validate case state** before each email action
5. **Log all email actions** for audit trail
6. **Use TLS encryption** for SMTP connections
7. **Generate App Passwords** for Gmail instead of master password

---

## 10. Testing the System

### Manual Testing

1. **Create a test case**:
   - Register as a normal user
   - Submit a medical case with required documents

2. **Update case status** (via Django admin or direct DB):
   - Set case to PENDING (if not already)
   - Verify hospital is assigned and has email

3. **Send hospital email**:
   - Go to Admin Panel → Mail Management
   - Click "Send Verification Mail to Hospital"
   - Check inbox for email

4. **Approve case**:
   - Update case status to HOSPITAL_VERIFIED

5. **Send university emails**:
   - Click "Send Funding Mail to Universities"
   - Check university inbox for emails

### Testing Without Real SMTP

For development, you can use Django's console email backend:

```python
# In settings.py (development only)
if DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

This will print emails to console instead of sending them.

---

## 11. Production Deployment

### Recommendations

1. **Use professional email service** (SendGrid, AWS SES, Mailgun)
2. **Set up email verification** for bounce/complaint handling
3. **Implement email templates** via email service provider
4. **Use background tasks** (Celery) for async email sending
5. **Set up monitoring** for failed email deliveries
6. **Implement rate limiting** to prevent spam

### Production .env Example

```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=SG.xxxxxxxxxxxx-your-sendgrid-key
DEFAULT_FROM_EMAIL=noreply@jeevandhara.org
```

---

## 12. Code Structure

### Files Modified/Created

1. **Backend**:
   - `backend/medical_cases/models.py` - Added email tracking fields
   - `backend/medical_cases/services.py` - Email service functions
   - `backend/medical_cases/email_templates.py` - HTML email templates
   - `backend/medical_cases/views.py` - Email API endpoints
   - `backend/medical_cases/urls.py` - Email routes
   - `backend/medical_cases/serializers.py` - Updated with email fields
   - `backend/jeevandhara/settings.py` - SMTP configuration

2. **Frontend**:
   - `frontend/src/pages/AdminDashboard.tsx` - Mail Management section and handlers

3. **Configuration**:
   - `.env` - SMTP credentials (not committed)
   - `backend/medical_cases/migrations/0005_*.py` - Database migrations

---

## 13. Troubleshooting

### Issue: "502 Bad Gateway" when sending email

**Solution**: Email sending might be taking too long. Consider implementing async tasks with Celery.

### Issue: "Email not received"

**Solutions**:

- Check spam/junk folder
- Verify recipient email in database
- Check SMTP logs via `python manage.py sendtestemail`
- Verify email credentials

### Issue: "Connection refused" on SMTP

**Solutions**:

- Check EMAIL_HOST and EMAIL_PORT are correct
- Verify firewall allows outbound connection on that port
- Check if TLS is enabled (587) vs SSL (465)

### Issue: Case status not updating in admin panel

**Solution**: Refresh the page or wait for the auto-refresh timeout (1 second after email sent).

---

## 14. API Examples

### Using Python Requests

```python
import requests

ACCESS_TOKEN = "your_access_token"
CASE_ID = 1

# Send hospital mail
response = requests.post(
    f"http://localhost:8000/api/medical-cases/{CASE_ID}/send-hospital-mail/",
    headers={"Authorization": f"Bearer {ACCESS_TOKEN}"}
)
print(response.json())

# Send university mail
response = requests.post(
    f"http://localhost:8000/api/medical-cases/{CASE_ID}/send-university-mail/",
    headers={"Authorization": f"Bearer {ACCESS_TOKEN}"}
)
print(response.json())
```

### Using JavaScript/Fetch

```javascript
const accessToken = localStorage.getItem("access_token");
const caseId = 1;

// Send hospital mail
fetch(`http://localhost:8000/api/medical-cases/${caseId}/send-hospital-mail/`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
})
  .then((res) => res.json())
  .then((data) => console.log(data));

// Send university mail
fetch(
  `http://localhost:8000/api/medical-cases/${caseId}/send-university-mail/`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  },
)
  .then((res) => res.json())
  .then((data) => console.log(data));
```

---

## 15. Summary

The Admin Email Workflow system is now fully implemented with:
✅ Database schema for tracking email status
✅ Professional HTML email templates
✅ Secure API endpoints (admin-only)
✅ Error handling and logging
✅ Admin dashboard UI for mail management
✅ SMTP configuration via environment variables
✅ Complete documentation

**Next steps**: Configure your SMTP credentials in `.env` and start sending emails!
