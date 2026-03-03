# Medical Case Registration - Quick Reference Guide

## 🎯 Feature Overview

Complete Medical Case Registration system for Normal Users (Patients) to submit their medical cases for funding verification.

---

## 📋 Implementation Checklist

### Backend ✅

- [x] `models.py` - MedicalCase, MedicalDocument models
- [x] `serializers.py` - Case & Document serializers with file handling
- [x] `views.py` - POST/GET endpoints with auth & permissions
- [x] `permissions.py` - IsNormalUser custom permission
- [x] `urls.py` - API routes
- [x] `admin.py` - Admin panel registration
- [x] `settings.py` - MEDIA settings configured
- [x] Main `urls.py` - medical_cases app included

### Frontend ✅

- [x] `MedicalCaseForm.tsx` - Complete form component
- [x] `RegisterCase.tsx` - Page wrapper with auth guard
- [x] `Profile.tsx` - User's cases display
- [x] `Dashboard.tsx` - Register case button
- [x] `auth.ts` - Auth guard hooks

---

## 🔌 API Endpoints

### Create Medical Case

```
POST /api/medical-cases/
Authorization: Bearer {token}
Content-Type: multipart/form-data

✅ Requires: NORMAL_USER role + JWT
✅ Returns: {case_id, message}
✅ Auto-assigns: current user
✅ Stores: documents in media/medical_documents/
```

### Get My Cases

```
GET /api/medical-cases/my-cases/
Authorization: Bearer {token}

✅ Requires: NORMAL_USER role + JWT
✅ Returns: array of user's cases with documents
```

---

## 🛣️ User Navigation Flow

```
Login → Dashboard → Click "Register Medical Case"
   ↓
/register-case → MedicalCaseForm Opens
   ↓
Fill All Fields → Upload Documents → Submit
   ↓
API: POST /api/medical-cases/ (FormData with files)
   ↓
Success Message → Redirect to /profile
   ↓
/profile → Fetch GET /api/medical-cases/my-cases/
   ↓
Display All User's Cases in Cards
```

---

## 📝 Form Fields

### Patient Details

- Patient Name\* (text)
- Age\* (number, 1-150)
- Gender\* (Male/Female/Other)
- Contact Number\* (phone format)
- Address\* (textarea)

### Medical Details

- Disease\* (text)
- Hospital\* (dropdown, fetched from /api/hospitals/)
- Treating Doctor\* (text)
- Treatment Description\* (textarea)
- Estimated Cost\* (decimal, in ₹)

### Campaign Details

- Required Funding\* (decimal, in ₹)
- Campaign Description\* (textarea)
- Urgency Level\* (Low/Medium/High)

### Documents (Optional)

- Multiple file upload
- Formats: PDF, JPG, PNG
- Auto-saved with case

---

## 🔐 Security Layers

| Layer        | Protection                                     |
| ------------ | ---------------------------------------------- |
| **Backend**  | JWT required + IsNormalUser permission         |
| **Frontend** | useAuthGuard prevents non-users from accessing |
| **Form**     | Field validation + file type validation        |
| **Database** | user_id enforced via ForeignKey                |

---

## 📁 File Structure

```
backend/
├── medical_cases/
│   ├── models.py           ✅ MedicalCase, MedicalDocument
│   ├── serializers.py       ✅ With file handling
│   ├── views.py             ✅ Create & fetch endpoints
│   ├── permissions.py       ✅ IsNormalUser
│   ├── urls.py              ✅ /api/medical-cases routes
│   ├── admin.py             ✅ Admin models
│   └── migrations/          ✅ Applied

frontend/
├── src/
│   ├── components/
│   │   └── MedicalCaseForm.tsx    ✅ Complete form
│   ├── pages/
│   │   ├── RegisterCase.tsx       ✅ Page wrapper
│   │   ├── Profile.tsx            ✅ Cases display
│   │   └── Dashboard.tsx          ✅ Register button
│   └── lib/
│       └── auth.ts                ✅ useAuthGuard hook
```

---

## 🧪 Testing

**Manual Flow:**

1. Login as Normal User
2. Go to Dashboard
3. Click "Register Medical Case"
4. Fill all fields
5. Upload document (optional)
6. Submit
7. Check /profile for the submitted case

**API Testing (with Bearer token):**

```bash
# Create case
curl -X POST http://localhost:8000/api/medical-cases/ \
  -H "Authorization: Bearer {token}" \
  -F "patient_full_name=John" \
  -F "age=45" \
  ...

# Get cases
curl -X GET http://localhost:8000/api/medical-cases/my-cases/ \
  -H "Authorization: Bearer {token}"
```

---

## 📊 Database Schema

**MedicalCase**

- Stores complete case information
- Links to user via ForeignKey
- Status: PENDING → HOSPITAL_VERIFIED → FUNDED
- Timestamps: created_at, updated_at

**MedicalDocument**

- File path stored in FileField
- Links to MedicalCase
- Uploaded_at timestamp

---

## 🚀 Deployment Notes

✅ **Media Files:**

- URL: `http://localhost:8000/media/medical_documents/{filename}`
- Path: `backend/media/medical_documents/`
- In production, use cloud storage (S3, Azure Blob)

✅ **Database:**

- Migrations applied: `python manage.py migrate`
- Admin accessible at: `http://localhost:8000/admin/`

✅ **CORS:**

- Already configured for localhost:5173 (React)
- Update CORS_ALLOWED_ORIGINS for production

---

## ⚡ Performance Considerations

✅ **Optimized Queries:**

- Hospital list fetched once on form mount
- Cases fetched on profile page load
- No N+1 queries (select_related used where needed)

✅ **File Handling:**

- Async file upload with FormData
- File size validated before upload
- Multiple files supported

---

## 🔧 Configuration

**Backend Settings (settings.py):**

```python
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'
AUTH_USER_MODEL = 'accounts.CustomUser'
```

**Frontend Auth (auth.ts):**

```typescript
useAuthGuard("NORMAL_USER"); // Protects routes
```

---

## 📝 Notes

- ❌ AI integration NOT implemented yet (as per requirements)
- ✅ Form data sent via FormData for file support
- ✅ All fields validated both client & server
- ✅ Permission denied returns 403 if not NORMAL_USER
- ✅ Timestamps auto-managed by Django

---

## 🎓 Learning Resources

- Django DRF: permissions, authentication, file uploads
- React: form handling, file input, async fetch
- JWT: token-based authentication
- FormData: multipart/form-data submission

---

**Status: READY FOR TESTING ✅**

All components implemented. Run tests and verify full flow works end-to-end.
