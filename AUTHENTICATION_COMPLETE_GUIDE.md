# Authentication System - Complete Implementation Guide

## Overview

This guide documents the complete production-ready authentication system implemented for JeevanDhara with clean UX, role-based redirects, and secure JWT token management.

---

## Table of Contents

1. [Backend Changes](#backend-changes)
2. [Frontend Changes](#frontend-changes)
3. [API Reference](#api-reference)
4. [Testing Guide](#testing-guide)
5. [Deployment Checklist](#deployment-checklist)

---

## Backend Changes

### 1. Updated Serializers (`backend/accounts/serializers.py`)

#### RegistrationSerializer

- **Purpose**: Validates registration input and prevents duplicate emails
- **Features**:
  - Validates email uniqueness
  - Validates username uniqueness
  - Ensures password confirmation matches
  - Uses `create_user()` for password hashing
  - Does NOT auto-login after registration
  - Returns user-friendly error messages

```python
# Usage in views:
serializer = RegistrationSerializer(data=request.data)
if serializer.is_valid():
    user = serializer.save()
```

#### CustomTokenObtainPairSerializer

- **Purpose**: JWT token generation with role-based response
- **Features**:
  - Uses `email` as unique identifier (username_field)
  - Uses `authenticate()` to validate credentials
  - Returns role information for frontend routing
  - Roles: "admin", "university", "user"
  - Clean error messages: "Invalid email or password."

```python
# Roles determination:
- is_superuser → "admin"
- email in ApprovedUniversityEmail → "university"
- Otherwise → "user"
```

### 2. Updated Views (`backend/accounts/views.py`)

#### RegisterView (NEW)

**Endpoint**: `POST /api/register/`

**Request**:

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123",
  "password_confirm": "securepass123"
}
```

**Success Response** (201):

```json
{
  "message": "Registration successful. Please login to continue.",
  "email": "john@example.com"
}
```

**Error Response** (400):

```json
{
  "errors": {
    "email": "This email is already registered. Please login instead.",
    "username": "This username is already taken."
  },
  "message": "Registration failed."
}
```

**Key Features**:

- ✅ Prevents duplicate email registration
- ✅ Does NOT auto-login
- ✅ User-friendly error messages
- ✅ Password is properly hashed using `create_user()`

#### LoginView (UPDATED)

**Endpoint**: `POST /api/login/`

**Request**:

```json
{
  "username": "john@example.com",
  "password": "securepass123"
}
```

**Success Response** (200):

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "role": "user",
  "email": "john@example.com",
  "username": "john_doe",
  "message": "Login successful."
}
```

**Error Response** (401):

```json
{
  "message": "Invalid email or password."
}
```

**Role-Based Responses**:

- `"role": "university"` - User is a university admin
- `"role": "user"` - Regular user
- `"role": "admin"` - Django superuser

### 3. Updated URLs (`backend/accounts/urls.py`)

```python
urlpatterns = [
    # New clean API endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),

    # Legacy OTP endpoints (for backward compatibility)
    path('send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
]
```

### 4. Settings Configuration (`backend/jeevandhara/settings.py`)

**JWT Settings** (already configured):

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

AUTH_USER_MODEL = 'accounts.CustomUser'
```

---

## Frontend Changes

### 1. Layout Components

#### AuthLayout (`src/layouts/AuthLayout.tsx`)

- **Purpose**: Layout for authentication pages (Login, Register)
- **Features**:
  - No navbar or footer
  - Centered, minimal design
  - Background gradient

**Usage**:

```tsx
<Route element={<AuthLayout />}>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
</Route>
```

#### MainLayout (`src/layouts/MainLayout.tsx`)

- **Purpose**: Layout for authenticated pages
- **Features**:
  - Includes Header (navbar)
  - Includes Footer
  - Full page layout with flex

**Usage**:

```tsx
<Route element={<MainLayout />}>
  <Route path="/" element={<Index />} />
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

### 2. Auth Utilities (`src/lib/auth.ts`)

#### Token Management

```typescript
import { setTokens, getAccessToken, getRefreshToken } from "@/lib/auth";

// Store tokens after login
setTokens(accessToken, refreshToken);

// Retrieve for API calls
const token = getAccessToken();
```

#### Role Management

```typescript
import { setUserRole, getUserRole, UserRole } from "@/lib/auth";

// Store user role after login
setUserRole("university");

// Get current role
const role: UserRole = getUserRole();
```

#### Authentication State

```typescript
import { isAuthenticated, logout } from "@/lib/auth";

// Check if user is logged in
if (isAuthenticated()) {
  // Show logout button
}

// Logout with redirect
logout(); // Redirects to /login
```

#### Route Protection

```typescript
import { useAuthGuard, canAccess } from "@/lib/auth";

// In component
useAuthGuard("university"); // Redirect if not logged in with role "university"

// In route decision
if (canAccess("admin")) {
  // Show admin content
}
```

### 3. API Utilities (`src/lib/api.ts`)

#### registerUser()

```typescript
const result = await registerUser({
  username: "john",
  email: "john@example.com",
  password: "pass123",
  password_confirm: "pass123",
});

// Success
if (result.success) {
  navigate("/login?registered=true");
}

// Error
if (result.errors) {
  // { email: "Email already registered", ... }
}
```

#### loginUser()

```typescript
const result = await loginUser({
  username: "john@example.com",
  password: "pass123",
});

if (result.success && result.data) {
  const { access, refresh, role, email } = result.data;
  setTokens(access, refresh);
  setUserRole(role);
  setUserEmail(email);
}
```

### 4. Pages

#### Register (`src/pages/Register.tsx`)

- **Features**:
  - Clean form with validation
  - Field-level error display
  - Successful registration redirects to `/login?registered=true`
  - Link to login page

#### Login (`src/pages/Login.tsx`)

- **Features**:
  - Email + password login
  - Shows success message if coming from registration
  - Role-based redirects:
    - "university" → `/university-dashboard`
    - "admin" → `/admin`
    - "user" → `/dashboard`
  - Link to register page

### 5. Header Component (`src/components/Header.tsx`)

**Conditional Rendering**:

- ✅ Navbar hidden on `/login` and `/register` (AuthLayout)
- ✅ Navbar shown on all other pages (MainLayout)
- ✅ Shows "Dashboard" and "Logout" when authenticated
- ✅ Shows "Login" and "Register" when not authenticated
- ✅ Protected links only visible when authenticated

**Logout Button**:

```tsx
<Button onClick={logout}>Logout</Button>
// Clears tokens and navigates to /login
```

### 6. App Routing (`src/App.tsx`)

```tsx
<Routes>
  {/* Auth Pages (no navbar) */}
  <Route element={<AuthLayout />}>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </Route>

  {/* Main Pages (with navbar) */}
  <Route element={<MainLayout />}>
    <Route path="/" element={<Index />} />
    <Route
      path="/dashboard"
      element={<ProtectedRoute element={<Dashboard />} />}
    />
    <Route
      path="/university-dashboard"
      element={
        <ProtectedRoute
          element={<UniversityPortal />}
          requiredRole="university"
        />
      }
    />
  </Route>
</Routes>
```

---

## API Reference

### Backend Base URL

```
http://localhost:8000/api/
```

### Registration API

**Endpoint**: `POST /register/`

**Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!"
}
```

**Response** (201 Created):

```json
{
  "message": "Registration successful. Please login to continue.",
  "email": "john@example.com"
}
```

**Error Responses**:

- **400 Bad Request** - Email already exists:

```json
{
  "errors": {
    "email": "This email is already registered. Please login instead."
  },
  "message": "Registration failed."
}
```

- **400 Bad Request** - Username taken:

```json
{
  "errors": {
    "username": "This username is already taken."
  },
  "message": "Registration failed."
}
```

- **400 Bad Request** - Passwords don't match:

```json
{
  "errors": {
    "password": "Passwords do not match."
  },
  "message": "Registration failed."
}
```

### Login API

**Endpoint**: `POST /login/`

**Headers**:

```
Content-Type: application/json
```

**Request Body**:

```json
{
  "username": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "role": "user",
  "email": "john@example.com",
  "username": "john_doe",
  "message": "Login successful."
}
```

**Error Response** (401 Unauthorized):

```json
{
  "message": "Invalid email or password."
}
```

### Using JWT Token in Requests

**Authorization Header** (for all authenticated endpoints):

```
Authorization: Bearer <access_token>
```

**Example**:

```bash
curl -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
     http://localhost:8000/api/protected-endpoint/
```

---

## Testing Guide

### 1. Backend Testing

**Test Registration**:

```bash
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "password_confirm": "testpass123"
  }'
```

**Expected**:

```json
{
  "message": "Registration successful. Please login to continue.",
  "email": "test@example.com"
}
```

**Test Duplicate Email**:

```bash
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test@example.com",
    "password": "testpass123",
    "password_confirm": "testpass123"
  }'
```

**Expected**:

```json
{
  "errors": {
    "email": "This email is already registered. Please login instead."
  },
  "message": "Registration failed."
}
```

**Test Login**:

```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "testpass123"
  }'
```

**Expected**:

```json
{
  "access": "...",
  "refresh": "...",
  "role": "user",
  "email": "test@example.com",
  "username": "testuser",
  "message": "Login successful."
}
```

**Test Invalid Credentials**:

```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "wrongpassword"
  }'
```

**Expected**:

```json
{
  "message": "Invalid email or password."
}
```

### 2. Frontend Testing

**Register Flow**:

1. Navigate to `http://localhost:5173/register`
2. Fill in: username, email, password, confirm password
3. Click "Create Account"
4. Should redirect to `/login?registered=true`
5. Should see "Registration Successful" banner

**Login Flow**:

1. Navigate to `http://localhost:5173/login`
2. Fill in: email, password
3. Click "Sign In"
4. Should redirect to `/dashboard` (for regular users)

**Role-Based Redirect**:

1. Create a university admin via Django admin
2. Login as that user
3. Should redirect to `/university-dashboard`

**Navbar Behavior**:

1. On `/login` and `/register` - navbar should NOT be visible
2. On `/` and other pages after login - navbar should be visible
3. Login/Register buttons should toggle to Dashboard/Logout

---

## Deployment Checklist

### Before Production

- [ ] Update `DEBUG = False` in `settings.py`
- [ ] Update `ALLOWED_HOSTS` in `settings.py`
- [ ] Update `CORS_ALLOWED_ORIGINS` for production domain
- [ ] Generate new `SECRET_KEY`
- [ ] Set strong `SIMPLE_JWT` token lifetimes
- [ ] Configure email backend for OTP (if using)
- [ ] Test all registration/login flows
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure environment variables in `.env`

### Environment Variables Needed

```env
# Backend
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
DATABASE_URL=your-database-url

# Email (if using email-based auth)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

### Production Security Checklist

- [ ] CSRF protection enabled
- [ ] CORS only allows production domain
- [ ] JWT token expiry set appropriately
- [ ] HTTPS required for all endpoints
- [ ] Password requirements enforced
- [ ] Email verification implemented (optional)
- [ ] Rate limiting on auth endpoints (optional)
- [ ] Monitor failed login attempts
- [ ] Regular security audits

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  AuthLayout                    MainLayout                    │
│  ├─ Login.tsx                 ├─ Header.tsx                  │
│  └─ Register.tsx              ├─ Pages                       │
│                               └─ Footer.tsx                  │
│                                                               │
│  Auth Utilities: lib/auth.ts                                 │
│  - Token management                                          │
│  - Role management                                           │
│  - Auth guard hooks                                          │
│                                                               │
│  API Utilities: lib/api.ts                                   │
│  - registerUser()                                            │
│  - loginUser()                                               │
│  - Auto JWT injection                                        │
└─────────────────────────────────────────────────────────────┘
           ↕ (REST API with JWT tokens)
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Django + DRF)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  accounts/urls.py                                            │
│  ├─ POST /api/register/                                      │
│  └─ POST /api/login/                                         │
│                                                               │
│  accounts/views.py                                           │
│  ├─ RegisterView                                             │
│  │  - Validate email uniqueness                              │
│  │  - Hash password with create_user()                       │
│  │  - NO auto-login                                          │
│  │                                                            │
│  └─ LoginView (TokenObtainPairView)                          │
│     - Authenticate credentials                               │
│     - Generate JWT tokens                                    │
│     - Determine and return role                              │
│                                                               │
│  accounts/serializers.py                                     │
│  ├─ RegistrationSerializer                                   │
│  └─ CustomTokenObtainPairSerializer                          │
│                                                               │
│  accounts/models.py                                          │
│  ├─ CustomUser (username, email, role)                       │
│  └─ ApprovedUniversityEmail                                  │
│                                                               │
│  settings.py                                                 │
│  ├─ SIMPLE_JWT configuration                                 │
│  └─ JWTAuthentication enabled                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Issue: "Email already registered" on first signup

**Cause**: Email already exists in database
**Solution**: Check the database, or create new test email

### Issue: Login redirects to wrong page

**Cause**: Role not set correctly in backend
**Solution**: Verify `ApprovedUniversityEmail` entry exists for university users

### Issue: JWT token not being sent in requests

**Cause**: Token not stored or interceptor not working
**Solution**: Check `api.ts` interceptor is attached, tokens are saved to localStorage

### Issue: Navbar appears on login page

**Cause**: Not using AuthLayout
**Solution**: Ensure Login/Register routes use `<AuthLayout>` wrapper

### Issue: Token expiration errors

**Cause**: Access token lifetime too short
**Solution**: Adjust `ACCESS_TOKEN_LIFETIME` in settings.py

---

## Migration from Old System

If migrating from old session-based auth:

1. **Backend**: Keep legacy OTP endpoints for existing users
2. **Frontend**:
   - Import new auth utilities
   - Replace `getSession()`/`setSession()` calls with new functions
   - Update localStorage keys
3. **Database**: No migrations needed (backward compatible)
4. **Testing**: Test both old and new auth flows

---

## Best Practices

### Backend

- ✅ Never expose technical error details
- ✅ Always hash passwords with `create_user()`
- ✅ Validate email uniqueness before user creation
- ✅ Set appropriate JWT token lifetimes
- ✅ Log auth attempts for security

### Frontend

- ✅ Store tokens in localStorage (consider sessionStorage for sensitive)
- ✅ Clear tokens on logout
- ✅ Inject token in Authorization header
- ✅ Show user-friendly error messages
- ✅ Redirect based on role after login
- ✅ Use layouts to hide navbar on auth pages

### Overall

- ✅ HTTPS in production
- ✅ CORS properly configured
- ✅ Rate limiting on auth endpoints
- ✅ Email verification for sensitive operations
- ✅ Monitor and alert on failed login attempts
