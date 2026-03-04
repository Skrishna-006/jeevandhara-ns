# Quick Reference - Authentication System

## Key Endpoints

### Registration

```
POST /api/register/
Content-Type: application/json

{
  "username": "john",
  "email": "john@example.com",
  "password": "pass123",
  "password_confirm": "pass123"
}

Response (201):
{
  "message": "Registration successful. Please login to continue.",
  "email": "john@example.com"
}
```

### Login

```
POST /api/login/
Content-Type: application/json

{
  "username": "john@example.com",
  "password": "pass123"
}

Response (200):
{
  "access": "<jwt_token>",
  "refresh": "<refresh_token>",
  "role": "user|university|admin",
  "email": "john@example.com",
  "username": "john",
  "message": "Login successful."
}
```

---

## Frontend Usage

### Import

```typescript
import {
  setTokens,
  getAccessToken,
  setUserRole,
  getUserRole,
  isAuthenticated,
  logout,
  useAuthGuard,
  canAccess,
} from "@/lib/auth";

import { registerUser, loginUser } from "@/lib/api";
```

### Registration

```typescript
const result = await registerUser({
  username: "john",
  email: "john@example.com",
  password: "pass123",
  password_confirm: "pass123",
});

if (result.success) {
  navigate("/login?registered=true");
} else {
  // Show result.errors or result.message
}
```

### Login

```typescript
const result = await loginUser({
  username: user@example.com",
  password: "pass123"
});

if (result.success && result.data) {
  setTokens(result.data.access, result.data.refresh);
  setUserRole(result.data.role);
  setUserEmail(result.data.email);

  // Redirect based on role
  if (result.data.role === "university") {
    navigate("/university-dashboard");
  } else if (result.data.role === "admin") {
    navigate("/admin");
  } else {
    navigate("/dashboard");
  }
}
```

### Logout

```typescript
import { logout } from "@/lib/auth";

logout(); // Clears tokens and redirects to /login
```

### Check Authentication

```typescript
import { isAuthenticated, canAccess } from "@/lib/auth";

if (isAuthenticated()) {
  // User is logged in
}

if (canAccess("university")) {
  // User is logged in AND has "university" role
}
```

### Protect Components

```typescript
import { useAuthGuard } from "@/lib/auth";

export function UniversityDashboard() {
  useAuthGuard("university"); // Redirect if not auth or wrong role

  return <div>University Dashboard</div>;
}
```

---

## Backend Usage

### Check User is University

```python
from accounts.models import ApprovedUniversityEmail

if ApprovedUniversityEmail.objects.filter(email=user.email).exists():
    # User is a university admin
    pass
```

### Create Regular User

```python
from accounts.models import CustomUser

user = CustomUser.objects.create_user(
    username="john",
    email="john@example.com",
    password="pass123"
)
```

### Create University Admin

```python
from accounts.models import CustomUser, ApprovedUniversityEmail

user = CustomUser.objects.create_user(
    username="uni_admin",
    email="admin@university.edu",
    password="pass123"
)

ApprovedUniversityEmail.objects.create(
    email="admin@university.edu"
)
```

### Create Admin User

```python
from accounts.models import CustomUser

admin = CustomUser.objects.create_superuser(
    username="admin",
    email="admin@example.com",
    password="adminpass123"
)
```

### Authenticate User (for API calls)

```python
from django.contrib.auth import authenticate

user = authenticate(
    username="john@example.com",
    password="pass123"
)

if user is not None:
    # Credentials valid
    pass
```

---

## Role-Based Redirects (Frontend)

| Role       | Redirect             | Path                    |
| ---------- | -------------------- | ----------------------- |
| `universe` | University Dashboard | `/university-dashboard` |
| `admin`    | Admin Panel          | `/admin`                |
| `user`     | User Dashboard       | `/dashboard`            |

---

## Error Codes

| Status | Error                       | Meaning                    |
| ------ | --------------------------- | -------------------------- |
| 201    | N/A                         | Registration successful    |
| 200    | N/A                         | Login successful           |
| 400    | "Email already registered"  | Duplicate signup           |
| 400    | "Username already taken"    | Duplicate signup           |
| 400    | "Passwords do not match"    | Password mismatch          |
| 401    | "Invalid email or password" | Login failed               |
| 401    | N/A                         | Token expired              |
| 403    | N/A                         | No permission for endpoint |

---

## Layouts

### AuthLayout (No navbar)

- `/login`
- `/register`

### MainLayout (With navbar)

- `/`
- `/dashboard`
- `/university-dashboard`
- `/admin`
- All other pages

---

## Changes Summary

### Backend

- ✅ New `RegisterView` for clean registration
- ✅ Updated `LoginView` with role-based responses
- ✅ New `RegistrationSerializer`
- ✅ Updated `CustomTokenObtainPairSerializer`
- ✅ User-friendly error messages
- ✅ Proper password hashing with `create_user()`

### Frontend

- ✅ `AuthLayout` for auth pages (no navbar)
- ✅ `MainLayout` for regular pages (with navbar)
- ✅ Updated `auth.ts` with JWT management
- ✅ Updated `api.ts` with auto JWT injection
- ✅ New `Register.tsx` page
- ✅ New `Login.tsx` page
- ✅ Updated `Header.tsx` with auth-aware nav
- ✅ Updated `App.tsx` with layout routing

---

## Testing Checklist

- [ ] Register with valid data → Redirect to `/login?registered=true`
- [ ] Register with duplicate email → Show error
- [ ] Register with duplicate username → Show error
- [ ] Login with valid credentials → Redirect based on role
- [ ] Login with invalid credentials → Show error
- [ ] Access `/login` → See navbar hidden
- [ ] Access `/register` → See navbar hidden
- [ ] Login as regular user → Redirect to `/dashboard`
- [ ] Login as university user → Redirect to `/university-dashboard`
- [ ] Login as admin → Redirect to `/admin`
- [ ] Click logout → Redirect to `/login`, tokens cleared
- [ ] Access protected route without token → Redirect to `/login`
- [ ] Access role-protected route with wrong role → Redirect to `/login`

---

## Useful Commands

### Create Test User (CLI)

```bash
cd backend
python manage.py shell

from accounts.models import CustomUser
user = CustomUser.objects.create_user(
    username="testuser",
    email="test@example.com",
    password="testpass123"
)
```

### Make University Admin (CLI)

```bash
python manage.py shell

from accounts.models import ApprovedUniversityEmail
ApprovedUniversityEmail.objects.create(email="admin@university.edu")
```

### Create Superuser (CLI)

```bash
python manage.py createsuperuser
```

### Test Login (cURL)

```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "testpass123"
  }'
```

### Test Protected Endpoint (cURL)

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/protected/
```

---

## Files Modified/Created

### Backend

- ✅ `backend/accounts/serializers.py` - Updated
- ✅ `backend/accounts/views.py` - Updated
- ✅ `backend/accounts/urls.py` - Updated

### Frontend

- ✅ `frontend/src/layouts/AuthLayout.tsx` - Created
- ✅ `frontend/src/layouts/MainLayout.tsx` - Created
- ✅ `frontend/src/lib/auth.ts` - Updated
- ✅ `frontend/src/lib/api.ts` - Updated
- ✅ `frontend/src/pages/Register.tsx` - Created
- ✅ `frontend/src/pages/Login.tsx` - Updated
- ✅ `frontend/src/components/Header.tsx` - Updated
- ✅ `frontend/src/App.tsx` - Updated

---

## Next Steps

1. **Test the authentication flows**:
   - Register a new account
   - Login with that account
   - Test all role-based redirects

2. **Set up email verification (optional)**:
   - Configure SendGrid or Gmail SMTP
   - Add email verification to registration

3. **Implement refresh token logic (optional)**:
   - Add endpoint to refresh access tokens
   - Auto-refresh before token expiry

4. **Add password reset (optional)**:
   - Create password reset endpoint
   - Frontend password reset page

5. **Production deployment**:
   - Update settings for production
   - Configure environment variables
   - Add rate limiting
   - Set up monitoring
