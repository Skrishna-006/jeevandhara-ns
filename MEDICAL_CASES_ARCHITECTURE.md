# Medical Case Registration - Architecture & Flow Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React @ localhost:5173)                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Login      │  │  Dashboard   │  │RegisterCase  │  │   Profile    │ │
│  │   Page       │─→│    Page      │─→│    Page      │─→│    Page      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│       │                    │                 │                  │         │
│       │ (JWT Token)        │ (useAuthGuard)  │                  │         │
│       └────────────────────┼─────────────────┼──────────────────┘         │
│                            │                 │                             │
│        ┌────────────────────────────────────────────────┐                 │
│        │                                                │                 │
│        │  MedicalCaseForm Component                     │                 │
│        │  ├─ Patient Details Fields                     │                 │
│        │  ├─ Medical Details Fields                     │                 │
│        │  ├─ Campaign Details Fields                    │                 │
│        │  ├─ Document Upload (Multi-file)              │                 │
│        │  ├─ Form Validation                            │                 │
│        │  └─ FormData Submission                        │                 │
│        │                                                │                 │
│        └────────────────────────────────────────────────┘                 │
│                            │                                              │
│                            ↓ (JWT Bearer Token + FormData)                │
│                                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│                          HTTP/HTTPS Network                              │
│                                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                      BACKEND (Django @ localhost:8000)                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      API ENDPOINTS                               │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                                                                  │  │
│  │  POST /api/medical-cases/                                       │  │
│  │  ├─ Authentication: @api_view(['POST'])                         │  │
│  │  ├─ Permission: IsAuthenticated + IsNormalUser                 │  │
│  │  ├─ Input: FormData with files                                 │  │
│  │  ├─ Auto-assign: request.user                                  │  │
│  │  ├─ Save files: MedicalDocument objects                        │  │
│  │  └─ Response: {case_id, message}                               │  │
│  │                                                                  │  │
│  │  GET /api/medical-cases/my-cases/                              │  │
│  │  ├─ Authentication: @api_view(['GET'])                         │  │
│  │  ├─ Permission: IsAuthenticated + IsNormalUser                 │  │
│  │  ├─ Filter: cases.filter(user=request.user)                   │  │
│  │  ├─ Serializer: MedicalCaseSerializer(many=True)              │  │
│  │  └─ Response: [cases with documents]                           │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      MODELS (ORM)                                │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                                                                  │  │
│  │  MedicalCase                                                    │  │
│  │  ├─ id (PK)                                                     │  │
│  │  ├─ user (FK → CustomUser) ◄── Auto-assigned                  │  │
│  │  ├─ Patient Details (5 fields)                                 │  │
│  │  ├─ Medical Details (5 fields)                                 │  │
│  │  ├─ Campaign Details (3 fields)                                │  │
│  │  ├─ status (default: PENDING)                                  │  │
│  │  ├─ created_at, updated_at                                     │  │
│  │  └─ documents (reverse FK) ◄── MedicalDocument objects        │  │
│  │                                                                  │  │
│  │  MedicalDocument                                                │  │
│  │  ├─ id (PK)                                                     │  │
│  │  ├─ medical_case (FK → MedicalCase)                            │  │
│  │  ├─ file (FileField → media/medical_documents/)               │  │
│  │  └─ uploaded_at                                                │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      DATABASE (SQLite)                           │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                                                                  │  │
│  │  medical_cases_medicalcase                                      │  │
│  │  medical_cases_medicaldocument                                  │  │
│  │  (plus other app tables)                                        │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   MEDIA FILES (Uploads)                          │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                                                                  │  │
│  │  backend/media/medical_documents/                               │  │
│  │  ├─ prescription_abc123.pdf                                     │  │
│  │  ├─ medical_report_def456.jpg                                   │  │
│  │  ├─ lab_test_ghi789.png                                         │  │
│  │  └─ ...                                                          │  │
│  │                                                                  │  │
│  │  Served at: http://localhost:8000/media/medical_documents/...  │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 User Flow Diagram

```
                         ┌──────────────┐
                         │  Start Here  │
                         └──────────────┘
                               │
                               ↓
                        ┌──────────────┐
                        │  Visit App   │
                        │localhost:5173│
                        └──────────────┘
                               │
                               ↓
                        ┌──────────────┐
                        │  See Login   │
                        │   Page       │
                        └──────────────┘
                               │
                               ↓
                        ┌──────────────┐
          No NORMAL_USER│ Authenticate │
          available?    │   as User    │
          ┌────────────→├──────────────┤
          │              │ JWT Token    │
          │              │ Stored       │
          │              └──────────────┘
          │                     │
          │                     ↓
          │              ┌──────────────┐
          │              │  Dashboard   │
          │              │   Page       │
          │              └──────────────┘
          │                     │
          │                     ↓  (useAuthGuard check)
          │              ┌──────────────┐──────────────┐
          │              │ Is role ==   │              │
          │              │ NORMAL_USER? │              │
          │              └──────┬───────┘              │
          │                     │                      │
          │                  Yes│                      │ No
          │                     ↓                      ↓
          │              ┌──────────────┐       ┌──────────────┐
          │              │"Register     │       │  Redirect    │
          │              │ Medical Case"│       │  to Login    │
          │              │  Button      │       └──────────────┘
          │              │  Visible     │
          │              └──────────────┘
          │                     │
          │                     ↓ (user clicks)
          │              ┌──────────────┐
          │              │ Navigate to  │
          │              │/register-case│
          │              └──────────────┘
          │                     │
          │                     ↓
          │              ┌──────────────┐
          │              │Medical Case  │
          │              │Form Opens    │
          │              │(Modal)       │
          │              └──────────────┘
          │                     │
          │                     ↓
          │              ┌──────────────┐
          │              │ Fill Fields: │
          │              │ ├─ Patient   │
          │              │ ├─ Medical   │
          │              │ ├─ Campaign  │
          │              │ └─ Documents │
          │              └──────────────┘
          │                     │
          │                     ↓
          │              ┌──────────────┐
          │              │Form Validates│
          │              │(Client-side) │
          │              └──────────────┘
          │                     │
          │                     ↓
          │              ┌──────────────┐
          │              │Click Submit  │
          │              │   Button     │
          │              └──────────────┘
          │                     │
          │                     ↓
          │              ┌──────────────┐
          │              │Prepare Form │
          │              │  Data +     │
          │              │  Files      │
          │              └──────────────┘
          │                     │
          │                     ↓
          │              ┌──────────────────────────────┐
          │              │POST /api/medical-cases/      │
          │              │with Bearer JWT Token         │
          │              └──────────────────────────────┘
          │                     │
          │                     ↓ (api call)
          │              ┌──────────────────────────────┐
          │              │Backend Processing:          │
          │              │1. Authenticate (JWT)        │
          │              │2. Check IsNormalUser        │
          │              │3. Validate serializer       │
          │              │4. Auto-assign user_id       │
          │              │5. Create MedicalCase        │
          │              │6. Save documents            │
          │              │7. Store files in media/     │
          │              └──────────────────────────────┘
          │                     │
          │                     ↓
          │              ┌──────────────┐
          │              │Response 201  │
          │              │{case_id,     │
          │              │ message}     │
          │              └──────────────┘
          │                     │
          │                     ↓
          │              ┌──────────────┐
          │              │Success Modal │
          │              │Shows Message │
          │              └──────────────┘
          │                     │
          │                     ↓ (after 2 sec)
          │              ┌──────────────┐
          │              │Navigate to   │
          │              │/profile      │
          │              └──────────────┘
          │                     │
          │                     ↓
          │              ┌──────────────────────────────┐
          │              │Profile Page:                │
          │              │Fetch GET /api/medical-cases/│
          │              │my-cases/                    │
          │              └──────────────────────────────┘
          │                     │
          │                     ↓
          │              ┌──────────────┐
          │              │Display Cases │
          │              │in Card Grid  │
          │              │              │
          │              │├─ Case #1    │
          │              │├─ Case #2    │
          │              │└─ Case #3    │
          │              └──────────────┘
          │                     │
          │                     ↓
          │              ┌──────────────┐
          │              │   Done!      │
          │              │   Success    │
          │              └──────────────┘
          │
          └─────→ (Create test user first in admin)
```

---

## 🔐 Permission & Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User enters credentials                                    │
│     ├─ Email: patient@example.com                             │
│     └─ Password: testpass123                                  │
│            │                                                  │
│            ↓                                                  │
│  2. POST /api/token/pair (from accounts app)                │
│     ├─ Validate credentials                                  │
│     ├─ Generate JWT tokens                                   │
│     │  ├─ accessToken (5 min)                                │
│     │  └─ refreshToken (24 hours)                            │
│     └─ Return tokens                                          │
│            │                                                  │
│            ↓                                                  │
│  3. Frontend stores in localStorage                          │
│     └─ localStorage.setItem('accessToken', token)            │
│            │                                                  │
│            ↓                                                  │
│  4. User clicks "Register Medical Case"                      │
│     ├─ Navigate to /register-case                           │
│     └─ useAuthGuard("NORMAL_USER") checks:                 │
│        ├─ Has accessToken? ✓                               │
│        ├─ Token still valid? ✓                              │
│        └─ Role == 'NORMAL_USER'? ✓                         │
│            │                                                  │
│            ↓                                                  │
│  5. Form submission                                          │
│     ├─ Get token: localStorage.getItem('accessToken')      │
│     ├─ Create FormData with case data                       │
│     └─ POST /api/medical-cases/ with:                      │
│        └─ Authorization: Bearer {accessToken}              │
│            │                                                  │
│            ↓                                                  │
│  6. Backend validates                                        │
│     ├─ Extract JWT from header                             │
│     ├─ Verify token signature                              │
│     ├─ Check token expiry                                  │
│     ├─ Get user from token (request.user)                 │
│     ├─ Check @permission_classes:                         │
│     │  ├─ IsAuthenticated:                                │
│     │  │  └─ Pass if user authenticated ✓                │
│     │  └─ IsNormalUser:                                  │
│     │     └─ Pass if user.role == 'NORMAL_USER' ✓       │
│     └─ Auto-assign user to case                           │
│            │                                                  │
│            ↓                                                  │
│  7. Success response 201                                     │
│     └─ {case_id: 1, message: "..."}                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

                        ERROR SCENARIOS

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  No Token                  401 Unauthorized                    │
│  ├─ localStorage empty     └─ "Authentication credentials     │
│  └─ Redirect to /login       were not provided."             │
│                                                                 │
│  Invalid Token             401 Unauthorized                    │
│  ├─ Expired                └─ "Token is invalid or expired"  │
│  ├─ Tampered                                                  │
│  └─ Redirect to /login                                        │
│                                                                 │
│  Wrong Role                403 Forbidden                       │
│  ├─ role != 'NORMAL_USER'  └─ "You do not have permission  │
│  ├─ role = 'ADMIN'           to perform this action."       │
│  └─ role = 'UNIVERSITY'                                       │
│                                                                 │
┘─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Data Flow Diagram

```
Frontend User Input
        │
        ├─ patient_full_name: "John Doe"
        ├─ age: 45
        ├─ gender: "Male"
        ├─ contact_number: "+919876543210"
        ├─ address: "123 Main St"
        ├─ disease: "Heart Disease"
        ├─ hospital: 1
        ├─ treating_doctor: "Dr. Smith"
        ├─ treatment_description: "Heart surgery"
        ├─ estimated_cost: 500000.00
        ├─ required_funding: 450000.00
        ├─ campaign_description: "Need funds"
        ├─ urgency_level: "High"
        └─ uploaded_files: [prescription.pdf, report.jpg]
             │
             ↓
      FormData Preparation
             │
             ├─ Append all text fields
             ├─ Append all file objects
             └─ Set boundary markers
             │
             ↓
      HTTP POST Request
             │
             ├─ URL: /api/medical-cases/
             ├─ Headers:
             │  ├─ Authorization: Bearer {token}
             │  └─ Content-Type: multipart/form-data
             └─ Body: FormData object
             │
             ↓
      Backend Processing
             │
             ├─ Parse JWT token
             ├─ Authenticate user
             ├─ Check permissions (IsNormalUser)
             ├─ Validate serializer
             │  ├─ Validate required fields
             │  ├─ Type check (int for age, decimal for cost)
             │  └─ Choice validation (gender, urgency)
             ├─ Create MedicalCase object
             │  ├─ Set user_id = request.user.id (auto)
             │  ├─ Set status = "PENDING" (default)
             │  ├─ Set all case fields
             │  └─ Save to medical_cases_medicalcase table
             ├─ Create MedicalDocument objects
             │  ├─ For each uploaded file:
             │  │  ├─ Save file to media/medical_documents/
             │  │  ├─ Create MedicalDocument row
             │  │  ├─ Set medical_case_id
             │  │  └─ Set uploaded_at timestamp
             │  └─ Save to medical_cases_medicaldocument table
             └─ Return response
             │
             ↓
      Response to Frontend
             │
             ├─ Status: 201 Created
             ├─ Body:
             │  ├─ case_id: 1
             │  └─ message: "Case submitted successfully"
             │
             ↓
      Frontend Processing
             │
             ├─ Check response status
             ├─ Show success modal
             └─ Redirect to /profile
             │
             ↓
      Profile Page Load
             │
             ├─ GET /api/medical-cases/my-cases/
             ├─ Backend filters: MedicalCase.objects.filter(user=current_user)
             ├─ Serialize with MedicalCaseSerializer
             ├─ Include documents (related_name="documents")
             ├─ Include hospital_name (from ForeignKey)
             └─ Return array of cases
             │
             ↓
      Display Cases
             │
             ├─ For each case in response:
             │  ├─ Render case card
             │  ├─ Show Case ID
             │  ├─ Show Patient Name
             │  ├─ Show Disease
             │  ├─ Show Hospital Name (from hospital_name)
             │  ├─ Show Required Funding (formatted with ₹)
             │  ├─ Show Status (with color badge)
             │  ├─ Show Created Date (formatted)
             │  └─ Show documents count
             └─ Display in grid layout
```

---

## 🗄️ Database Relationships

```
CustomUser (from accounts app)
│
├─ id (PK)
├─ email
├─ password
├─ role (choices: ADMIN, NORMAL_USER, UNIVERSITY)
│
└─ Relationship
   └─ OneToMany ──→ MedicalCase.user_id (FK)
                    │
                    ├─ id (PK)
                    ├─ user_id (FK) ◄─ relates back
                    ├─ patient_full_name
                    ├─ age
                    ├─ gender
                    ├─ contact_number
                    ├─ address
                    ├─ disease
                    ├─ hospital_id (FK) ◄─ to Hospital
                    ├─ treating_doctor
                    ├─ treatment_description
                    ├─ estimated_cost
                    ├─ required_funding
                    ├─ campaign_description
                    ├─ urgency_level
                    ├─ status
                    ├─ created_at
                    ├─ updated_at
                    │
                    └─ Relationship
                       └─ OneToMany ──→ MedicalDocument.medical_case_id (FK)
                                        │
                                        ├─ id (PK)
                                        ├─ medical_case_id (FK) ◄─ relates back
                                        ├─ file (FileField)
                                        └─ uploaded_at

Hospital (from hospital app)
│
├─ id (PK)
├─ name
├─ (other fields...)
│
└─ Relationship
   └─ OneToMany ──→ MedicalCase.hospital_id (FK)
```

---

## ✅ Complete Implementation Checklist

```
BACKEND IMPLEMENTATION
├─ ✅ Models
│  ├─ MedicalCase (13 fields + 2 timestamps + ForeignKeys)
│  ├─ MedicalDocument (3 fields + timestamp + FK)
│  └─ All model relationships configured
├─ ✅ Serializers
│  ├─ MedicalCaseSerializer (handles file uploads)
│  ├─ MedicalDocumentSerializer
│  └─ Auto file creation in serializer.create()
├─ ✅ Views
│  ├─ create_medical_case (POST)
│  ├─ get_user_medical_cases (GET)
│  └─ Both protected with auth & permissions
├─ ✅ Permissions
│  └─ IsNormalUser (checks role == 'NORMAL_USER')
├─ ✅ URLs
│  ├─ /api/medical-cases/ (POST)
│  ├─ /api/medical-cases/my-cases/ (GET)
│  └─ Included in main urls.py
├─ ✅ Admin
│  ├─ MedicalCaseAdmin (with fieldsets & filters)
│  ├─ MedicalDocumentAdmin
│  └─ Both registered with @admin.register
├─ ✅ Settings
│  ├─ MEDIA_ROOT configured
│  ├─ MEDIA_URL configured
│  ├─ medical_cases in INSTALLED_APPS
│  └─ Serve media in development
└─ ✅ Database
   ├─ Migrations created (No changes needed)
   ├─ Tables created
   └─ All constraints in place

FRONTEND IMPLEMENTATION
├─ ✅ MedicalCaseForm Component
│  ├─ Patient Details section (5 fields)
│  ├─ Medical Details section (5 fields)
│  ├─ Campaign Details section (3 fields)
│  ├─ Document Upload section (multi-file)
│  ├─ Form validation (client-side)
│  ├─ File validation (format & size)
│  ├─ FormData submission
│  └─ Token from localStorage
├─ ✅ RegisterCase Page
│  ├─ useAuthGuard("NORMAL_USER")
│  ├─ Imports MedicalCaseForm
│  └─ Handles close/success callbacks
├─ ✅ Profile Page
│  ├─ useAuthGuard("NORMAL_USER")
│  ├─ Fetches GET /api/medical-cases/my-cases/
│  ├─ Displays cases in cards
│  ├─ Shows status badges
│  └─ Empty state message
├─ ✅ Dashboard Integration
│  ├─ "Register Medical Case" button visible for users
│  ├─ Navigates to /register-case on click
│  └─ Button styled and responsive
└─ ✅ Auth Hook
   ├─ useAuthGuard checks token
   ├─ useAuthGuard checks role
   └─ useAuthGuard redirects on fail

TESTING & DOCUMENTATION
├─ ✅ MEDICAL_CASES_IMPLEMENTATION.md
├─ ✅ MEDICAL_CASES_QUICK_REFERENCE.md
├─ ✅ MEDICAL_CASES_API_REFERENCE.md
├─ ✅ MEDICAL_CASES_DEPLOYMENT_TESTING.md
└─ ✅ Architecture Diagrams

STATUS: 100% COMPLETE ✅
```

---

**Last Updated:** March 3, 2024
**Ready for Testing:** ✅
**Estimated Setup Time:** 5-10 minutes
