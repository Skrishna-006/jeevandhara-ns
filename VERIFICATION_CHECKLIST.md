# ✅ VERIFICATION CHECKLIST - Token Validation Fix

Use this checklist to verify that all fixes are working correctly.

---

## ✅ PART 1: Backend Setup (10 minutes)

### 1.1 Prerequisites

- [ ] Python 3.x installed
- [ ] pip installed and working
- [ ] Backend directory accessible at `d:\curetrust\backend\`
- [ ] Django installed (`pip install django`)

### 1.2 Run Setup Script

```bash
cd d:\curetrust\backend
python quick_setup.py
```

Expected output:

```
[1/4] Running migrations...
✅ Migrations completed

[2/4] Fixing missing user roles...
✅ User roles fixed

[3/4] Checking admin account...
✅ Admin exists: admin@example.com

[4/4] Creating test users...
✅ Created Normal User: normaluser@example.com
✅ Updated Hospital User: hospital@example.com
✅ Updated University User: university@example.com
```

Verification:

- [ ] No errors in output
- [ ] All 4 steps show ✅
- [ ] No "❌" marks

---

## ✅ PART 2: Database Verification (5 minutes)

### 2.1 Check Users Have Roles

```bash
cd d:\curetrust\backend
python manage.py shell
```

Then run:

```python
from accounts.models import CustomUser

# Check test users exist and have roles
users = [
    'normaluser@example.com',
    'hospital@example.com',
    'university@example.com'
]

for email in users:
    user = CustomUser.objects.filter(email=email).first()
    if user:
        print(f"✅ {email}: role={user.role}, active={user.is_active}")
    else:
        print(f"❌ {email}: NOT FOUND")

exit()
```

Verification:

- [ ] All 3 test users found
- [ ] All have role assigned (not None)
- [ ] All are active (is_active=True)

### 2.2 Check Admin Account

```python
from accounts.models import CustomUser

admin = CustomUser.objects.filter(is_superuser=True).first()
if admin:
    print(f"✅ Admin: {admin.email}")
else:
    print(f"❌ No admin found")
    # If missing, run: python manage.py createsuperuser

exit()
```

Verification:

- [ ] Admin account exists
- [ ] Admin email noted for login

---

## ✅ PART 3: Token Generation Test (3 minutes)

### 3.1 Run Token Flow Test

```bash
cd d:\curetrust\backend
python test_token_flow.py
```

Expected output (should see 7 tests):

```
============================================================
  JWT TOKEN VALIDATION TEST SUITE
============================================================

==================================================
  TEST 1: User Existence
==================================================
✅ Found NORMAL_USER: normaluser@example.com

==================================================
  TEST 2: User Role Assignment
==================================================
✅ User role is set: NORMAL_USER

==================================================
  TEST 3: Token Generation
==================================================
✅ Access Token (first 50 chars): eyJ0eXAiOiJKV1QiLCJhbGc...
✅ Refresh Token (first 50 chars): eyJ0eXAiOiJKV1QiLCJhbGc...

==================================================
  TEST 4: Token Payload Decode
==================================================
✅ Token decoded successfully
  - User ID: 5
  - Token Type: access
  - Issued At: 1234567890
  - Expires At: 1234567900
✅ Token signature is VALID

==================================================
  TEST 5: Email/Password Authentication
==================================================
✅ Authentication successful for normaluser@example.com

==================================================
  TEST 6: CustomTokenObtainPairSerializer
==================================================
✅ Serializer validation passed
  - Has access token: True
  - Has refresh token: True
  - Has role: True
  - Role value: NORMAL_USER
  - Has email: True

==================================================
  TEST 7: API Endpoint Test
==================================================
✅ API call successful (Status: 200)
  - Response type: list
  - Cases found: 0
```

Verification:

- [ ] All 7 tests show ✅ (green)
- [ ] Token signature is VALID
- [ ] Access token generated
- [ ] Role returned
- [ ] API call successful

---

## ✅ PART 4: Frontend Preparation (2 minutes)

### 4.1 Clear Old Data

1. Open browser (Chrome, Firefox, Edge, etc.)
2. Go to http://localhost:5173 (or your frontend URL)
3. Press F12 to open DevTools
4. Go to Application tab → Local Storage
5. Delete all items starting with `jh_`:
   - [ ] Delete `jh_access_token` (if exists)
   - [ ] Delete `jh_refresh_token` (if exists)
   - [ ] Delete `jh_user_role` (if exists)
   - [ ] Delete `jh_user_email` (if exists)

Verification:

- [ ] Local Storage is empty (no jh\_\* items)

---

## ✅ PART 5: Login Test (3 minutes)

### 5.1 Login Flow

1. Go to http://localhost:5173/login
2. Enter:
   - Email: `normaluser@example.com`
   - Password: `Test@123`
3. Click Login button

Verification:

- [ ] Login button responds (shows loading state)
- [ ] No red error message
- [ ] Browser does NOT show error toast
- [ ] Page redirects to Dashboard

### 5.2 Check Tokens Were Stored

1. After successful login, press F12
2. Go to Application tab → Local Storage
3. Verify tokens were stored:

```javascript
// Run in DevTools Console
console.log(
  "Access Token:",
  localStorage.getItem("jh_access_token")?.substring(0, 50),
);
console.log(
  "Refresh Token:",
  localStorage.getItem("jh_refresh_token")?.substring(0, 50),
);
console.log("Role:", localStorage.getItem("jh_user_role"));
console.log("Email:", localStorage.getItem("jh_user_email"));
```

Expected output:

```
Access Token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Refresh Token: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Role: user
Email: normaluser@example.com
```

Verification:

- [ ] `jh_access_token` exists (not empty)
- [ ] `jh_refresh_token` exists (not empty)
- [ ] `jh_user_role` is "user" (lowercase!)
- [ ] `jh_user_email` is "normaluser@example.com"

---

## ✅ PART 6: Dashboard Test (5 minutes)

### 6.1 Dashboard Should Load

After login, you should see:

- [ ] User profile section at the top
- [ ] Email displayed in profile
- [ ] User ID displayed in profile
- [ ] "Your Uploaded Cases" section
- [ ] Cases loading indicator appears briefly

### 6.2 Check Console for Errors

Press F12 → Console tab

Look for these messages:

- ✅ Should see: `[DEBUG] Fetching cases for user ...`
- ✅ Should NOT see any red errors
- ✅ Should NOT see: "token not valid"
- ✅ Should NOT see: "not authorized"
- ✅ Should NOT see: "401"

Verification:

- [ ] No red error messages
- [ ] No token errors visible
- [ ] Console is clean (no scary messages)

### 6.3 Check Network Tab

1. Open DevTools → Network tab
2. Clear network history
3. Refresh the page
4. Look for `my-cases` request

Click on the `my-cases` request:

- [ ] Status: 200 (green, not red)
- [ ] Response: Should show JSON with cases (or empty array `[]`)
- [ ] Headers: Should show `Authorization: Bearer ...`

Expected response:

```json
[]  // Empty array if no cases yet
// OR
[
  {
    "id": 1,
    "patient_full_name": "Patient Name",
    "disease": "Disease Name",
    "ai_credibility_score": 8.5,
    ...
  }
]
```

Verification:

- [ ] Status code is 200 (not 401, 403, 500)
- [ ] Response is valid JSON
- [ ] Authorization header present

---

## ✅ PART 7: Role-Based Access Control (5 minutes)

### 7.1 Test Normal User Access

Currently logged in as `normaluser@example.com`

Check that you CAN access:

- [ ] Dashboard page loads
- [ ] "Register Medical Case" button visible
- [ ] API endpoint `/api/medical-cases/my-cases/` returns 200

### 7.2 Test University User

1. Logout (click logout button or delete localStorage)
2. Login as: `university@example.com` / `Test@123`

Check that access is different:

- [ ] May not see "Register Case" (depends on UI)
- [ ] May see different Dashboard
- [ ] Role in localStorage should be "university"

### 7.3 Test Admin User

1. Logout
2. Login as: `admin@example.com` / (password you set during `createsuperuser`)

Check that access is different:

- [ ] Admin dashboard should appear
- [ ] Role in localStorage should be "admin"
- [ ] Different UI elements visible

Verification:

- [ ] Different roles have different dashboards
- [ ] Role stored correctly in localStorage
- [ ] No access control errors

---

## ✅ PART 8: API Endpoint Test (3 minutes)

### 8.1 Test API Directly from Console

```javascript
// In DevTools console while logged in
const token = localStorage.getItem("jh_access_token");

// Test 1: Get user's cases
fetch("http://localhost:8000/api/medical-cases/my-cases/", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
})
  .then((r) => {
    console.log("Status:", r.status);
    return r.json();
  })
  .then((data) => {
    console.log("Response:", data);
  })
  .catch((err) => {
    console.error("Error:", err);
  });
```

Verification:

- [ ] Status: 200 (not 401, 403)
- [ ] Response is JSON array
- [ ] No "token not valid" error
- [ ] Can see data or empty array

### 8.2 Test Invalid Token

```javascript
// Test with invalid/expired token
const mock_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.INVALID.INVALID";

fetch("http://localhost:8000/api/medical-cases/my-cases/", {
  headers: {
    Authorization: `Bearer ${mock_token}`,
    "Content-Type": "application/json",
  },
})
  .then((r) => {
    console.log("Status:", r.status);
    return r.json();
  })
  .then((data) => {
    console.log("Response:", data);
  })
  .catch((err) => {
    console.error("Error:", err);
  });
```

Expected:

- [ ] Status: 401 (Unauthorized)
- [ ] Response: Error message about invalid token

Verification:

- [ ] System correctly rejects invalid tokens
- [ ] Valid token works, invalid doesn't

---

## ✅ PART 9: Backend Logs Verification (2 minutes)

### 9.1 Check Django Terminal Output

In terminal running `python manage.py runserver`, look for:

When API is called:

```
[DEBUG] Fetching cases for user normaluser@example.com with role NORMAL_USER
```

Verification:

- [ ] See [DEBUG] messages
- [ ] Shows correct user email
- [ ] Shows correct role (NORMAL_USER, UNIVERSITY, etc.)

When token is invalid:

```
[DEBUG] Access denied - role=None, should be NORMAL_USER
```

Verification:

- [ ] If role is None, fix_user_roles needs to run
- [ ] Should not see this for valid users

---

## ✅ PART 10: Functionality Test (5 minutes)

### 10.1 Try to Register a Case

1. Go to Dashboard
2. Click "Register Medical Case" button
3. Fill in basic info (Hospital selection)

Check:

- [ ] Hospitals load in dropdown
- [ ] No token errors while loading hospitals
- [ ] Can select a hospital

### 10.2 Submit Case (Optional)

If you have medical documents:

- [ ] Can upload files
- [ ] Can submit case
- [ ] Get success notification

Expected after submission:

- [ ] Case appears in "Your Uploaded Cases"
- [ ] AI score displays
- [ ] Status shows "PENDING"

Verification:

- [ ] Full workflow works
- [ ] No errors throughout
- [ ] Case persists (appears in list after refresh)

---

## ✅ FINAL SUMMARY

### All Tests Passing? ✅✅✅

- [ ] Part 1: Backend setup successful
- [ ] Part 2: Database has users with roles
- [ ] Part 3: Token generation works
- [ ] Part 4: Frontend cache cleared
- [ ] Part 5: Login successful, tokens stored
- [ ] Part 6: Dashboard loads without errors
- [ ] Part 7: Role-based access works
- [ ] Part 8: API endpoints respond correctly
- [ ] Part 9: Backend logs show correct data
- [ ] Part 10: Full workflow functional

### Status

```
✅ Token validation fixed
✅ Medical cases loading
✅ Dashboard working
✅ Role-based access implemented
✅ API endpoints responding
✅ All tests passing
```

---

## ❌ TROUBLESHOOTING

If any test FAILS, follow these steps:

### If Setup Script Failed

```bash
# Try running each step individually
python manage.py migrate
python manage.py fix_user_roles
python manage.py createsuperuser
```

### If Token Test Failed

```bash
python test_token_flow.py
# Note which test failed (1-7)
# See TOKEN_VALIDATION_TESTING_GUIDE.md for that specific issue
```

### If Dashboard Shows Errors

```javascript
// Run in console
localStorage.clear(); // Clear everything
// Then login again fresh
```

### If API Returns 401

```bash
# Check if token is valid
python manage.py shell
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import CustomUser

user = CustomUser.objects.get(email='normaluser@example.com')
token = RefreshToken.for_user(user)
print(str(token.access_token))

exit()

# Decode this token and verify
import jwt
jwt.decode(token_string, options={'verify_signature': False})
```

### If Role Shows as None

```bash
python manage.py fix_user_roles
# Then login again
```

---

## Documentation References

| Error              | Read This                         | Run This                        |
| ------------------ | --------------------------------- | ------------------------------- |
| Setup failed       | IMPLEMENTATION_COMPLETE.md        | python quick_setup.py           |
| Token errors       | TOKEN_VALIDATION_TESTING_GUIDE.md | python test_token_flow.py       |
| Role issues        | JWT_TOKEN_SYSTEM_ARCHITECTURE.md  | python manage.py fix_user_roles |
| Need help          | DOCUMENTATION_INDEX.md            | -                               |
| Want to understand | COMPLETE_SOLUTION_SUMMARY.md      | -                               |

---

## ✅ Completion Criteria

The fix is **COMPLETE** when:

```
✅ All 10 verification parts pass
✅ No token errors in console
✅ Dashboard loads without errors
✅ Cases display in "Your Uploaded Cases"
✅ Role-based access works correctly
✅ API endpoints return 200 status
✅ Backend logs show [DEBUG] messages
✅ Users can register new cases
✅ Full workflow is functional
```

If any of these is NOT true, use the troubleshooting section above.

---

## Next Steps After Verification

1. ✅ **Bookmark** `DOCUMENTATION_INDEX.md` for future reference
2. ✅ **Backup** the working state (git commit or backup)
3. ✅ **Train** team members using QUICK_REFERENCE_CARD.md
4. ✅ **Monitor** Django logs for issues
5. ✅ **Use** the system with confidence!

---

**🎉 If all checkboxes are marked ✅, the token validation fix is complete and working!**

The system is now ready for production use.

---

**Questions?** Check DOCUMENTATION_INDEX.md → pick your document → find your answer.
