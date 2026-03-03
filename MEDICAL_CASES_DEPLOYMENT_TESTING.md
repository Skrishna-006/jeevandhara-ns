# Medical Case Registration Feature - Deployment & Testing Guide

## ✅ Implementation Status: COMPLETE

All backend and frontend components are fully implemented and ready for testing.

---

## 🚀 Quick Start

### Backend Setup

```bash
# Navigate to backend
cd d:\curetrust\backend

# Activate virtual environment
.\env\Scripts\Activate.ps1

# Ensure all dependencies installed
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers python-dotenv psycopg2-binary

# Create database migrations (if needed)
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser (if needed)
python manage.py createsuperuser

# Start development server
python manage.py runserver 8000
```

### Frontend Setup

```bash
# Navigate to frontend
cd d:\curetrust\frontend

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun run dev
```

### Access Points

| Service     | URL                         |
| ----------- | --------------------------- |
| React App   | http://localhost:5173       |
| Django API  | http://localhost:8000       |
| Admin Panel | http://localhost:8000/admin |
| API Docs    | http://localhost:8000/api/  |

---

## 📊 Complete Implementation Summary

### Backend Files (All ✅)

| File             | Status      | Purpose                                |
| ---------------- | ----------- | -------------------------------------- |
| `models.py`      | ✅ Complete | 2 models: MedicalCase, MedicalDocument |
| `serializers.py` | ✅ Complete | 2 serializers with file handling       |
| `views.py`       | ✅ Complete | 2 endpoints: create, get_my_cases      |
| `permissions.py` | ✅ Complete | IsNormalUser custom permission         |
| `urls.py`        | ✅ Complete | 2 URL patterns mapped                  |
| `admin.py`       | ✅ Complete | Both models registered                 |
| `migrations/`    | ✅ Applied  | Database schema created                |

### Frontend Files (All ✅)

| File                  | Status      | Purpose                   |
| --------------------- | ----------- | ------------------------- |
| `MedicalCaseForm.tsx` | ✅ Complete | Full form with validation |
| `RegisterCase.tsx`    | ✅ Clean    | Page wrapper with auth    |
| `Profile.tsx`         | ✅ Complete | Cases display page        |
| `Dashboard.tsx`       | ✅ Updated  | Register button added     |
| `auth.ts`             | ✅ Ready    | useAuthGuard hook         |

### Configuration Files

| File               | Status     | Changes                     |
| ------------------ | ---------- | --------------------------- |
| `settings.py`      | ✅ Updated | MEDIA_ROOT, MEDIA_URL added |
| `urls.py` (main)   | ✅ Updated | medical_cases included      |
| `requirements.txt` | ✅ OK      | All deps present            |

---

## 🧪 Testing Workflow

### Phase 1: Authentication Verification

```bash
# 1. Access Django Admin
Navigate to: http://localhost:8000/admin/

# 2. Login with superuser credentials
Email: admin@example.com
Password: (your admin password)

# 3. Verify in Users:
- At least one NORMAL_USER exists with role='NORMAL_USER'
- Check: Accounts > Custom Users > Edit User > Role

# 4. If no NORMAL_USER exists, create one:
- Create new user
- Email: patient@example.com
- Password: testpass123
- Role: NORMAL_USER (very important!)
- Save
```

### Phase 2: Frontend Login Flow

```bash
# 1. Start frontend app
npm run dev

# 2. Navigate to http://localhost:5173

# 3. Click "Patient" login

# 4. Enter credentials:
Email: patient@example.com
Password: testpass123

# 5. Should see Dashboard with "Register Medical Case" button
```

### Phase 3: Medical Case Registration

```bash
# 1. On Dashboard, click "Register Medical Case"

# 2. Form should open with sections:
- Patient Details (name, age, gender, contact, address)
- Medical Details (disease, hospital dropdown, doctor, treatment, cost)
- Campaign Details (funding, description, urgency)
- Document Upload (optional file upload)

# 3. Fill all required fields:
Patient Name: John Doe
Age: 45
Gender: Male
Contact: +919876543210
Address: 123 Main St, Delhi

Disease: Heart Disease
Hospital: Select from dropdown
Doctor: Dr. Rajesh Kumar
Treatment: Heart surgery required
Estimated Cost: 500000

Required Funding: 450000
Description: Need funds for heart surgery
Urgency: High

# 4. Optional: Select document to upload
(PDF, JPG, or PNG)

# 5. Click "Submit Case"

# 6. Should see success message
"Case submitted successfully"

# 7. Should redirect to /profile
```

### Phase 4: Profile Page Verification

```bash
# 1. After redirect, should be on /profile

# 2. Should see section "Medical Cases"

# 3. Should see submitted case in card format:
- Case ID: 1
- Patient Name: John Doe
- Disease: Heart Disease
- Hospital: (selected hospital name)
- Required Funding: ₹450,000
- Status: PENDING (blue badge)
- Submitted: (today's date)

# 4. If multiple cases, should all be listed

# 5. If no cases, should see:
"No medical cases submitted yet."
```

### Phase 5: Backend API Validation

```bash
# 1. Test case creation via API
curl -X POST http://localhost:8000/api/medical-cases/ \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: multipart/form-data" \
  -F "patient_full_name=Test Patient" \
  -F "age=40" \
  -F "gender=Male" \
  -F "contact_number=+919999999999" \
  -F "address=Test Address" \
  -F "disease=Test Disease" \
  -F "hospital=1" \
  -F "treating_doctor=Dr. Test" \
  -F "treatment_description=Test treatment" \
  -F "estimated_cost=100000" \
  -F "required_funding=80000" \
  -F "campaign_description=Test campaign" \
  -F "urgency_level=Medium"

# 2. Response should be:
{
  "case_id": 2,
  "message": "Case submitted successfully"
}

# 3. Test fetching cases
curl -X GET http://localhost:8000/api/medical-cases/my-cases/ \
  -H "Authorization: Bearer {access_token}"

# 4. Should return array of user's cases with all details
```

### Phase 6: Admin Panel Verification

```bash
# 1. Go to http://localhost:8000/admin/

# 2. Login with admin account

# 3. Under "MEDICAL CASES" section, should see:
- Medical cases
- Medical documents

# 4. Click "Medical cases"

# 5. Should see list of all submitted cases with:
- Case ID
- Patient Name
- Disease
- Hospital
- Status (PENDING badge)
- Urgency Level
- Created date

# 6. Click on any case to view/edit details

# 7. Should see fieldsets:
- User
- Patient Details
- Medical Details
- Campaign Details
- Status
- Timestamps

# 8. Click on any case > Documents section
Should show uploaded files with timestamps
```

---

## 🔍 Debugging Checklist

### Issue: "No NORMAL_USER permission" Error

**Solution:**

```bash
# 1. Check user role in admin panel
http://localhost:8000/admin/accounts/customuser/

# 2. Edit your user and set Role = NORMAL_USER

# 3. Logout and login again

# 4. JWT token should now include role='NORMAL_USER'
```

### Issue: "Hospital not found" Error

**Solution:**

```bash
# 1. Check if hospitals exist in database
# Go to Admin > Hospitals

# 2. If empty, create hospitals:
- Name: Apollo Hospitals
- (Save)

# 3. Go back to form and refresh
# Dropdown should show hospital
```

### Issue: File Upload Fails

**Solution:**

```bash
# 1. Check file format (must be PDF, JPG, PNG)

# 2. Check file size (max shown in form)

# 3. Verify media folder exists:
backend/media/medical_documents/

# 4. Check folder permissions (should be writable)
```

### Issue: API Returns 403 Forbidden

**Solution:**

```bash
# 1. Verify IsNormalUser permission
# Check: backend/medical_cases/permissions.py

# 2. Check user.role in JWT token
# Decode token at: jwt.io

# 3. User must have role == 'NORMAL_USER'
```

### Issue: Form Not Submitting

**Solution:**

```bash
# 1. Check browser console for errors
# F12 > Console tab

# 2. Check if JWT token is in localStorage
# F12 > Application > Local Storage > accessToken

# 3. Verify API endpoint:
# http://localhost:8000/api/medical-cases/

# 4. Check backend server is running
# Terminal should show "Starting development server at..."
```

---

## 📱 Mobile/Responsive Testing

```bash
# 1. Open DevTools (F12)

# 2. Click Device Emulation

# 3. Test on:
- iPhone 12
- iPad
- Android device

# 4. Verify:
- Form fields responsive
- File upload works
- Buttons clickable
- Case cards readable
```

---

## 🔒 Security Testing

```bash
# 1. Test without token
curl -X GET http://localhost:8000/api/medical-cases/my-cases/
# Should return 401 Unauthorized

# 2. Test with wrong token
curl -X GET http://localhost:8000/api/medical-cases/my-cases/ \
  -H "Authorization: Bearer invalid_token"
# Should return 401 Unauthorized

# 3. Test with ADMIN user
# Should return 403 Forbidden (wrong role)

# 4. Verify user_id auto-assigned
# Created cases should only belong to logged-in user

# 5. Verify CSRF protection
# POST without CSRF token in production should fail
```

---

## ✅ Pre-Deployment Checklist

- [ ] All migrations applied: `python manage.py migrate`
- [ ] Superuser created: `python manage.py createsuperuser`
- [ ] At least one NORMAL_USER exists
- [ ] Frontend builds without errors: `npm run build`
- [ ] Backend runs without errors: `python manage.py runserver`
- [ ] Hospital objects exist in database
- [ ] JWT tokens stored in localStorage
- [ ] CORS configured for frontend domain
- [ ] Media folder writable: `backend/media/`
- [ ] All test cases pass

---

## 📝 Common Issues & Solutions

| Issue                  | Cause                  | Solution               |
| ---------------------- | ---------------------- | ---------------------- |
| 403 Forbidden          | User not NORMAL_USER   | Set role in admin      |
| 404 Hospital not found | Invalid hospital ID    | Create hospitals first |
| File not uploaded      | Wrong format           | Use PDF/JPG/PNG only   |
| Form validation fails  | Missing required field | Fill all fields        |
| No cases shown         | User has no cases      | Submit a case first    |
| Token expired          | Old token              | Login again            |

---

## 🎉 Success Criteria

✅ Feature is working correctly if:

1. **Login works** - Can login as NORMAL_USER
2. **Dashboard shows button** - "Register Medical Case" visible
3. **Form opens** - Can see all field sections
4. **Form submits** - Can fill and submit case
5. **Success message** - See confirmation after submit
6. **Profile shows cases** - Cases listed after redirect
7. **Admin shows cases** - Cases visible in admin panel
8. **Files saved** - Uploaded files in media folder
9. **API works** - Manual API calls succeed
10. **Pagination works** - Multiple cases display correctly

---

## 📞 Support

If you encounter issues:

1. **Check logs:** `python manage.py runserver` output
2. **Browser console:** F12 > Console tab
3. **Admin panel:** Verify data exists
4. **API tests:** Use curl or Postman
5. **Documentation:** Refer to MEDICAL_CASES_API_REFERENCE.md

---

## 🎓 Next Steps After Verification

1. ✅ Test complete flow end-to-end
2. ⏳ Implement hospital verification (future)
3. ⏳ Add AI analysis (future)
4. ⏳ Email notifications
5. ⏳ Payment integration
6. ⏳ Deploy to production

---

**Last Updated:** March 3, 2024
**Status:** Ready for Testing ✅
**Version:** 1.0

---

## 📂 Documentation Files

- `MEDICAL_CASES_IMPLEMENTATION.md` - Complete feature overview
- `MEDICAL_CASES_QUICK_REFERENCE.md` - Quick lookup guide
- `MEDICAL_CASES_API_REFERENCE.md` - API request/response examples
- `MEDICAL_CASES_DEPLOYMENT_TESTING.md` - This file
