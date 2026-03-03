# ⚡ Medical Cases Feature - 5 Minute Quick Start

## ✅ Pre-Flight Checklist

```bash
# 1. Backend ready?
cd d:\curetrust\backend
python manage.py migrate  # Should say "No migrations to apply"

# 2. Frontend ready?
cd d:\curetrust\frontend
ls node_modules  # Should exist

# 3. Have a NORMAL_USER?
# Check Admin at http://localhost:8000/admin/
# If not, go to Accounts > Users > Add User > Set Role=NORMAL_USER
```

---

## 🚀 Start Services (3 terminals)

### Terminal 1: Backend

```bash
cd d:\curetrust\backend
.\env\Scripts\Activate.ps1
python manage.py runserver 8000
# Expected: "Starting development server at http://127.0.0.1:8000/"
```

### Terminal 2: Frontend

```bash
cd d:\curetrust\frontend
npm run dev
# Expected: "VITE v... ready in 200ms"
# Local: http://localhost:5173
```

### Terminal 3: Monitor (Optional)

```bash
# Keep open for debugging output
```

---

## 🧪 Quick Test Path (5 minutes)

### Step 1: Login (30 seconds)

```
1. Go to http://localhost:5173
2. Click "Patient" login button
3. Enter: patient@example.com / testpass123
   (or your NORMAL_USER credentials)
4. Click "Login"
5. Should see Dashboard ✅
```

### Step 2: Register Case (1 minute)

```
1. On Dashboard, find "Register Medical Case" card
2. Click the card or "Register Case" button
3. MedicalCaseForm modal opens ✅

Fill Form (Quick Test Data):
┌─ Patient Name: John Doe
├─ Age: 45
├─ Gender: Male
├─ Contact: +919876543210
├─ Address: Test Address
├─ Disease: Test Disease
├─ Hospital: (Select any from dropdown)
├─ Doctor: Dr. Test
├─ Treatment: Test treatment
├─ Estimated Cost: 100000
├─ Required Funding: 80000
├─ Campaign: Need help with treatment
└─ Urgency: High

4. OPTIONAL: Upload a document (PDF/JPG/PNG)
5. Click "Submit Case"
6. Should see "Case submitted successfully" ✅
```

### Step 3: Verify (1 minute)

```
1. Should auto-redirect to /profile
2. Should see submitted case in a card:
   ├─ Case ID
   ├─ Patient Name: John Doe
   ├─ Disease: Test Disease
   ├─ Hospital: (selected hospital)
   ├─ Required Funding: ₹80,000
   ├─ Status: PENDING (blue badge)
   └─ Created: (today's date)
3. Perfect! ✅
```

### Step 4: Admin Check (1.5 minutes)

```
1. Go to http://localhost:8000/admin/
2. Login with admin credentials
3. Under "MEDICAL CASES" section:
   ├─ Click "Medical cases"
   └─ Should see your submitted case ✅
4. Click the case to view full details
5. Can see all fields + uploaded documents
```

---

## 🔧 Troubleshooting

### "404 Not Found" on /api/medical-cases/

```
✓ Backend running? Check Terminal 1
✓ URL correct? Should be localhost:8000/api/medical-cases/
✓ Migrations applied? Run: python manage.py migrate
✓ App registered? Check settings.py has 'medical_cases'
```

### "NORMAL_USER" Permission Denied

```
✓ Check user role in admin panel
✓ User must have role = 'NORMAL_USER' (case-sensitive!)
✓ Logout and login again after role change
✓ Check token is stored in localStorage
```

### Files Not Uploading

```
✓ File format correct? (PDF, JPG, PNG only)
✓ File size OK? Check form for limit
✓ Media folder exists? backend/media/medical_documents/
✓ Folder writable? Check Windows permissions
```

### Form Validation Errors

```
✓ All required fields filled? (marked with *)
✓ Hospital selected? (not "Select Hospital")
✓ Age number between 1-150?
✓ Check browser console (F12) for exact error
```

---

## 📊 Key Endpoints

| Method | Endpoint                     | Purpose        |
| ------ | ---------------------------- | -------------- |
| POST   | /api/medical-cases/          | Create case    |
| GET    | /api/medical-cases/my-cases/ | Get my cases   |
| POST   | /api/token/                  | Get JWT token  |
| POST   | /api/hospitals/              | List hospitals |

**All require:** `Authorization: Bearer {accessToken}`

---

## 🎯 Form Fields Reference

### Always Required (\*)

- patient_full_name
- age
- gender
- contact_number
- address
- disease
- hospital
- treating_doctor
- treatment_description
- estimated_cost
- required_funding
- campaign_description
- urgency_level

### Optional

- uploaded_files (documents)

---

## 💾 Where Data Goes

**Database:**

```
SQLite: backend/db.sqlite3
Tables:
  ├─ medical_cases_medicalcase (cases)
  └─ medical_cases_medicaldocument (files)
```

**Files:**

```
Uploaded to: backend/media/medical_documents/
Accessible at: http://localhost:8000/media/medical_documents/filename
```

**Frontend:**

```
Stored: localStorage (accessToken)
Cache: React state during session
```

---

## 🔐 Security Validation

### Check: Can ADMIN access?

```bash
1. Login as ADMIN user
2. Navigate to /register-case
3. Should be redirected to /login ✅
```

### Check: Can UNIVERSITY access?

```bash
1. Login as UNIVERSITY user
2. Navigate to /register-case
3. Should be redirected to /login ✅
```

### Check: Can anonymous access?

```bash
1. Logout completely
2. Navigate to /register-case
3. Should redirect to /login ✅
```

---

## 📱 Files to Know About

**Backend:**

- `backend/medical_cases/models.py` - Data structure
- `backend/medical_cases/views.py` - API logic
- `backend/medical_cases/serializers.py` - Data validation
- `backend/medical_cases/permissions.py` - Access control

**Frontend:**

- `frontend/src/components/MedicalCaseForm.tsx` - Form
- `frontend/src/pages/RegisterCase.tsx` - Page
- `frontend/src/pages/Profile.tsx` - Cases list
- `frontend/src/lib/auth.ts` - Auth logic

**Config:**

- `backend/jeevandhara/settings.py` - Media & INSTALLED_APPS
- `backend/jeevandhara/urls.py` - App routing

---

## 🐛 Debug Mode

### Enable verbose logging:

```python
# Set in settings.py
DEBUG = True  # Already set

# View logs in terminal where you ran runserver
```

### Check API response in browser:

```javascript
// Paste in console (F12) while logged in
fetch("/api/medical-cases/my-cases/", {
  headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
})
  .then((r) => r.json())
  .then(console.log);
```

### Inspect database:

```bash
cd backend
python manage.py dbshell
.tables  # Should show medical_cases_* tables
```

---

## ✨ Success Indicators

| What           | Expected           | Where               |
| -------------- | ------------------ | ------------------- |
| Form Opens     | Modal appears      | Click "Register..." |
| Fields Visible | All sections shown | Form modal          |
| Submit Works   | Success message    | After click         |
| Redirect Works | Go to /profile     | After success       |
| Case Shows     | Card in list       | Profile page        |
| Admin Shows    | Case in list       | Admin panel         |
| Files Saved    | In media folder    | backend/media/      |

---

## 📞 Can't Get It Working?

1. **Check logs:**
   - Terminal 1: Backend output
   - Terminal 2: Frontend output
   - DevTools F12: Console messages

2. **Verify setup:**
   - Is backend running? http://localhost:8000/
   - Is frontend running? http://localhost:5173/
   - Is database migrated? `python manage.py migrate`

3. **Check database:**
   - Does NORMAL_USER exist?
   - Are hospitals created?
   - Check admin panel

4. **Clear cache:**
   - Clear localStorage: DevTools > Application
   - Clear browser cache: Ctrl+Shift+Del
   - Fresh page load: Ctrl+Shift+R

---

## 🎓 What Happened Behind The Scenes

When you submitted the form:

```
Frontend             Backend              Database         Storage
  │                   │                     │                │
  ├─ Validate form    │                     │                │
  ├─ Create FormData  │                     │                │
  ├─ Add JWT token    │                     │                │
  └─ POST request ────→─ Authenticate      │                │
                       ├─ Check permission  │                │
                       ├─ Validate data ────→─ Verify       │
                       ├─ Auto-assign user  │                │
                       ├─ Save case ───────→─ Create row    │
                       ├─ Save files ──────────────────────→─ Store files
                       └─ Response 201 ←────←────←────←────→
                                        Success!
```

---

## 🚀 Ready to Test?

```bash
✓ Backend running on :8000
✓ Frontend running on :5173
✓ NORMAL_USER exists
✓ All 4 steps above ready
✓ Go to http://localhost:5173
✓ Login → Register → Submit → Verify!
```

**Expected time: 5 minutes**

---

**Status: ✅ READY**
**Last Updated: March 3, 2024**
