# Email Configuration Guide

## Current Status: ✅ WORKING (Console Backend for Development)

The system is currently configured to use Django's **Console Email Backend** in development mode. This means:

- Emails are printed to the console output instead of being sent via SMTP
- No Gmail credentials needed for testing/development
- The complete email workflow (sending, status updates, button disabling) works perfectly

## Test Results

✅ Hospital verification emails are successfully being sent (printed to console)
✅ Case status is updated with `hospital_mail_sent = True`
✅ Frontend button is automatically disabled after successful send
✅ Email content includes all case details, AI assessment, and verification requirements

---

## For Production: Gmail Configuration

When ready to deploy to production, follow these steps to enable real email sending via Gmail:

### Step 1: Enable 2FA on Gmail Account

1. Go to https://myaccount.google.com/
2. Navigate to "Security" in the left menu
3. Enable "2-Step Verification"

### Step 2: Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select **Mail** and **Windows Computer** (or your platform)
3. Google will generate a 16-character app password
4. Copy this password

### Step 3: Update `.env` File

Add the following to `backend/.env`:

```env
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

⚠️ **Important Notes:**

- Replace `your-email@gmail.com` with your actual Gmail address
- Use the 16-character app password (including spaces) as `EMAIL_HOST_PASSWORD`
- **DO NOT commit these credentials to Git** - keep them in `.env` only
- The `.env` file should be in `gitignore`

### Step 4: Test Production Configuration

Once credentials are set, the system will automatically:

1. Load your Gmail credentials from `.env`
2. Switch from console backend to SMTP backend
3. Send real emails via Gmail

Test by running:

```bash
cd backend
python test_hospital_email.py
```

You should see actual emails received in the target inbox instead of console output.

---

## Email Workflow Summary

### Hospital Verification Email

- **Trigger**: Admin clicks "Send Hospital Mail" button
- **Recipient**: Hospital contact email
- **Content**: Complete medical case details, AI assessment, verification requirements
- **Status Update**: Case `hospital_mail_sent` set to `True`
- **UI Effect**: Button hidden after successful send

### University Funding Email

- **Trigger**: Admin clicks "Send University Mail" button (only after hospital email sent)
- **Recipients**: All active universities
- **Content**: Case details and funding request
- **Status Update**: Case `university_mail_sent` set to `True`
- **UI Effect**: Button hidden, success badge shown

### Database Updates

Both email functions automatically update the case:

- `hospital_mail_sent` (Boolean)
- `hospital_mail_sent_at` (Timestamp)
- `university_mail_sent` (Boolean)
- `university_mail_sent_at` (Timestamp)

These fields prevent duplicate emails and ensure buttons are disabled after sending.

---

## Configuration Files

### Backend Settings (`backend/jeevandhara/settings.py`)

```python
# Automatically detects if credentials are configured
# Uses console backend for development (no credentials)
# Uses SMTP backend for production (with credentials)
```

### Environment File (`backend/.env`)

```env
# Development (current)
EMAIL_HOST_USER = None
EMAIL_HOST_PASSWORD = None

# Production (when ready)
EMAIL_HOST_USER = your-email@gmail.com
EMAIL_HOST_PASSWORD = xxxx xxxx xxxx xxxx
```

---

## Troubleshooting

### Error: "Username and Password not accepted"

- Verify app-specific password (not regular Gmail password)
- Ensure 2FA is enabled on Gmail account
- Check that password has no leading/trailing spaces

### Emails Not Sending (but no error)

- Check that credentials are correct in `.env`
- Verify email backend is using SMTP (not console)
- Check Django server logs for actual error messages

### Check Current Backend

```bash
cd backend
python -c "import django; django.setup(); from django.conf import settings; print(settings.EMAIL_BACKEND)"
```

---

## Development Workflow

During development, emails will be printed to your console. When implementing features that send emails:

1. Test locally with console backend (current setup)
2. Verify email content and recipients are correct
3. Check that case status updates are working
4. Verify frontend button states update correctly

Once you're ready to go live, simply add Gmail credentials to `.env` and the system will automatically switch to real email sending.

---

## Related Files

- **Backend Service**: `backend/medical_cases/services.py`
- **Email Templates**: `backend/medical_cases/email_templates.py`
- **API Views**: `backend/medical_cases/views.py`
- **Frontend**: `frontend/src/pages/AdminDashboard.tsx`
- **Database Model**: `backend/medical_cases/models.py`

---

## Summary

✅ **Current State**: Hospital email sending working perfectly with console backend
✅ **Database Updates**: Cases are being marked as sent
✅ **UI Updates**: Buttons are disabled after sending, success messages shown
⏰ **Next Steps**: In production, add Gmail credentials to `.env` to enable real email sending
