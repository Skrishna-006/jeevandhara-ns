# Token Validation Fix - Testing & Debugging Guide

## 🔧 Step 1: Fix Missing User Roles (CRITICAL)

The most likely cause of "Given token not valid for any token type" is that users don't have roles assigned in the database.

**Run this command in the backend:**

```bash
cd backend
python manage.py fix_user_roles
```

This will:

- Find all users without a role assigned
- Assign "NORMAL_USER" for regular users
- Assign "UNIVERSITY" for approved university emails
- Skip superusers (they use is_superuser flag)

---

## 🧪 Step 2: Test the Flow Manually

### 2A. Clear Everything and Login Fresh

1. **Close the frontend application**
2. **Open DevTools (F12) → Application → Local Storage → DELETE EVERYTHING related to 'jh\_'**
   - Delete: `jh_access_token`, `jh_refresh_token`, `jh_user_role`, `jh_user_email`
3. **Close the browser tab completely** (optional but recommended)
4. **Log out from Django Admin** at `http://localhost:8000/admin/`
5. **Restart the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

### 2B. Login with a Fresh Token

1. Go to `http://localhost:5173/login` (or your frontend URL)
2. Login with a **normal user account** (not university, not admin)
3. Check DevTools Console for any errors
4. Check DevTools Application → Local Storage for the new tokens

---

## 📋 Step 3: Verify Token is Valid

**In Browser Console (F12 → Console):**

```javascript
// Check token exists
const token = localStorage.getItem("jh_access_token");
console.log("Token:", token ? token.substring(0, 50) + "..." : "MISSING");

// Check email
const email = localStorage.getItem("jh_user_email");
console.log("Email:", email);

// Check role
const role = localStorage.getItem("jh_user_role");
console.log("Role:", role);

// Try the API directly
fetch("http://localhost:8000/api/medical-cases/my-cases/", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
})
  .then((r) => r.json())
  .then((data) => console.log("Response:", data))
  .catch((err) => console.error("Error:", err));
```

---

## 🔍 Step 4: Check Backend Logs

**Terminal running Django (backend):**

1. Look for these debug messages:

   ```
   [DEBUG] Fetching cases for user [email] with role NORMAL_USER
   [DEBUG] Access denied - role=..., should be NORMAL_USER
   ```

2. If you see "Given token not valid for any token type", check if:
   - Token encoding is broken
   - JWT library version mismatch
   - Token expired already

---

## 💾 Step 5: Check Database Directly

**In Backend Terminal:**

```bash
cd backend
python manage.py shell
```

Then run these commands:

```python
from accounts.models import CustomUser

# Check if your test user exists
user = CustomUser.objects.filter(email='your.email@example.com').first()
if user:
    print(f"User: {user.email}")
    print(f"Role: {user.role}")
    print(f"Is Staff: {user.is_staff}")
    print(f"Is Superuser: {user.is_superuser}")
    print(f"ID: {user.id}")
else:
    print("User not found")

# Check if there are ANY users with role set
users_with_role = CustomUser.objects.exclude(role__isnull=True)
print(f"\nUsers with role assigned: {users_with_role.count()}")
for u in users_with_role[:5]:
    print(f"  - {u.email}: {u.role}")

# Exit
exit()
```

---

## ✅ Step 6: If Dashboard Still Shows Error

### Option A: Check Network Tab

1. Open DevTools → Network tab
2. Refresh the Dashboard page
3. Look for `my-cases` request
4. Click on it and check:
   - **Status**: Should be 200 (not 403 or 500)
   - **Response**: Should show JSON with cases (or empty array if no cases)
   - **Headers**: Should see `Authorization: Bearer <token>`

### Option B: If Response is 401 or "Not authorized"

The token is invalid. Try this:

1. **Logout completely**: Click logout button or delete localStorage
2. **Login again**
3. **Immediately check the token** in localStorage
4. **Make the API call** within 5 minutes of login

### Option C: If Response is 403 but different error

Example: "Only normal users can submit cases"

- This means the role is NOT "NORMAL_USER"
- Check if user was registered as NORMAL_USER (run fix_user_roles)
- Check if email matches ApprovedUniversityEmail (would be assigned UNIVERSITY role)

---

## 🐛 Step 7: Common Issues & Solutions

### Issue: Token shows in console but API returns 401

**Solution:**

```bash
# Backend - check if tokens are being generated correctly
cd backend
python manage.py shell
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import CustomUser

user = CustomUser.objects.get(email='your.email@example.com')
refresh = RefreshToken.for_user(user)
print(f"Access: {str(refresh.access_token)}")
print(f"Refresh: {str(refresh)}")

# Try decoding (should not raise error)
import jwt
token = str(refresh.access_token)
payload = jwt.decode(token, options={"verify_signature": False})
print(f"Payload: {payload}")
exit()
```

### Issue: "given token not valid for any token type"

**Solution:**

```bash
# Check JWT secret key is consistent
cd backend
python manage.py shell
from django.conf import settings
print("SECRET_KEY:", settings.SECRET_KEY[:20] + "...")
exit()

# Restart Django
python manage.py runserver
```

### Issue: Token generates but role is None/empty

**Solution:**

```bash
cd backend
python manage.py fix_user_roles
```

---

## 🚀 Step 8: Full Reset (Nuclear Option)

If nothing works, do a complete reset:

```bash
# Backend
cd backend

# Delete old database
rm db.sqlite3

# Create fresh database
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Create a test normal user
python manage.py shell
from accounts.models import CustomUser
CustomUser.objects.create_user(email='test@example.com', password='Test@123')
exit()

# Restart Django
python manage.py runserver
```

**Then in Frontend:**

```bash
# Delete all localStorage
# In browser console:
Object.keys(localStorage).forEach(key => {
  if(key.startsWith('jh_')) localStorage.removeItem(key)
})

# Login again
```

---

## 📊 Step 9: Verify Everything Works

### 9A. Dashboard Should Show:

- ✅ User email in profile section
- ✅ User ID in profile section
- ✅ "Your Uploaded Cases" section (even if empty)
- ✅ Loading should complete within 2 seconds

### 9B. No Red Error Messages For:

- "Token not valid"
- "Not authorized"
- "Given token not valid for any token type"

### 9C. Try Creating a Case:

- Click "Register Medical Case"
- Hospitals should load (if API is running)
- Submit a test case (requires medical + financial documents)
- Should redirect with "Case submitted successfully"

---

## 📞 If Still Stuck

Provide this information when asking for help:

1. **What command did you run?**
   - Example: `python manage.py fix_user_roles`
   - What did it output?

2. **What error do you see?**
   - In browser console?
   - In Django terminal?
   - In DevTools Network tab?

3. **Browser Console Output:**

   ```javascript
   // Run in DevTools console
   console.log(
     "Token:",
     localStorage.getItem("jh_access_token")?.substring(0, 30),
   );
   console.log("Role:", localStorage.getItem("jh_user_role"));
   console.log("Email:", localStorage.getItem("jh_user_email"));
   ```

4. **Django Debug Output:**
   - Copy any `[DEBUG]` messages from terminal

5. **User Details:**
   - What email did you login with?
   - Is this a new user or existing user?
   - Did they login before the fixes were applied?

---

## 🎯 Expected Timeline

1. **fix_user_roles command**: < 1 minute
2. **Fresh login**: 2-3 minutes
3. **Dashboard load**: Should be instant (< 2 seconds)
4. **Cases display**: Should appear immediately

**If any step takes longer than expected, there's an issue to debug.**
