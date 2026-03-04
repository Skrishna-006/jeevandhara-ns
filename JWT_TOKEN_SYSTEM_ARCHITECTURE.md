# JWT Token System Architecture (After Fixes)

## 🏗️ System Overview

The JWT authentication system uses Django REST Framework's SimpleJWT library with custom extensions for role-based access control.

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER LOGIN FLOW                               │
└─────────────────────────────────────────────────────────────────┘

1. Frontend sends: POST /api/login/
   {
     "email": "user@example.com",
     "password": "password123"
   }

2. Backend processes (CustomTokenObtainPairSerializer):
   - Authenticate email/password
   - Generate access_token & refresh_token (standard JWT format)
   - Determine role from database (NORMAL_USER, UNIVERSITY, or ADMIN)
   - Return: { access, refresh, role, email }

3. Frontend stores in localStorage:
   {
     "jh_access_token": "eyJ0eXAi...",
     "jh_refresh_token": "eyJ0eXAi...",
     "jh_user_role": "user",           // Normalized to lowercase
     "jh_user_email": "user@example.com"
   }

4. Frontend makes API requests:
   GET /api/medical-cases/my-cases/
   Authorization: Bearer jh_access_token

5. Backend processes (CustomJWTAuthentication):
   - Extract token from Authorization header
   - Use SimpleJWT to validate token signature
   - Load user from database
   - Refresh user data (get latest role)
   - Return request.user with role attribute set
   - Request proceeds to view

6. View checks role:
   if request.user.role == 'NORMAL_USER':
       return cases
   else:
       return 403 Forbidden
```

---

## 🔐 Token Structure

### Access Token (JWT Format)

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "token_type": "access",
  "exp": 1234567890,      // Expiration timestamp
  "iat": 1234567800,      // Issued at timestamp
  "jti": "abc123...",     // JWT ID (unique)
  "user_id": 5,           // User's database ID
  ...other claims...
}

Signature: HMAC-SHA256(header.payload, SECRET_KEY)
```

**⚠️ CRITICAL:** The token signature is calculated from the header + payload. Modifying the payload AFTER generation breaks the signature and makes the token invalid.

### Refresh Token

Similar to access token but with `"token_type": "refresh"`.

---

## 💾 User Role Determination

### During Registration

```
CustomUser Registration:
1. Email provided: user@example.com
2. Check ApprovedUniversityEmail table:
   - If found → role = "UNIVERSITY"
   - If NOT found → role = "NORMAL_USER"
3. Save user to database with role
```

### During Login

```
CustomTokenObtainPairSerializer.validate():
1. Find user by email
2. Check user.role attribute in database
3. Include role in response data:
   { "access": "token...", "refresh": "token...", "role": "NORMAL_USER" }
4. Frontend gets role and STORES in localStorage
```

### During API Requests

```
CustomJWTAuthentication.authenticate():
1. Extract token from Authorization header
2. Use SimpleJWT's parent method to validate signature
3. Extract user_id from token payload
4. Query database: CustomUser.objects.get(id=user_id)
5. Call user.refresh_from_db() to get latest data
6. Set request.user.role from database (not from token claims)
7. Return (user, token)
```

---

## 🔄 Why We Don't Embed Role in Token Claims

### ❌ WRONG APPROACH (Previously Attempted)

```python
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # PROBLEM: Modifying token after generation!
        token['role'] = user.role  # ← THIS BREAKS THE SIGNATURE
        return token
```

**Why this fails:**

- JWT signature = HMAC(header + original_payload, SECRET_KEY)
- When we modify the payload by adding 'role', the signature no longer matches
- SimpleJWT's validation checks: SHA256(modified_header+payload) != stored_signature
- Error: "Given token not valid for any token type"

### ✅ CORRECT APPROACH (Current Implementation)

```python
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Use parent's standard token generation (NO MODIFICATION)
        refresh = self.get_token(user)

        # Generate standard JWT without custom claims
        # Token has: token_type, exp, iat, jti, user_id, ...
        # Token does NOT have: role

        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'role': user.role,  # ← SEPARATE from token
            'email': user.email
        }
```

**Why this works:**

- Token signature remains valid (unmodified payload)
- Role is sent separately in response JSON
- Frontend stores role in localStorage
- On API requests, role is loaded from database, not token

---

## 📡 Key Code Components

### 1. Backend: CustomJWTAuthentication

**File:** `backend/accounts/authentication.py`

```python
class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Call parent's validation (uses original signature check)
        result = super().authenticate(request)
        if result is None:
            return None

        user, validated_token = result

        # Refresh user from database to get latest role
        user.refresh_from_db()

        # Ensure role attribute exists
        if not hasattr(user, 'role') or not user.role:
            user.role = 'NORMAL_USER'

        return user, validated_token
```

**Location in Django pipeline:**

- Runs AFTER token signature validation
- Runs BEFORE view code
- Only requests with valid tokens reach this point
- User is loaded fresh from database each time

---

### 2. Backend: CustomTokenObtainPairSerializer

**File:** `backend/accounts/serializers.py`

```python
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        # Authenticate user
        user = authenticate(username=email, password=password)
        if not user:
            raise AuthenticationFailed('Invalid credentials')

        # Generate standard tokens (no modification)
        refresh = self.get_token(user)

        # Determine role
        role = user.role if user.role else 'NORMAL_USER'

        # Return: tokens + role separately
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'role': role,
            'email': user.email,
            'user_id': user.id,
        }
```

---

### 3. Backend: API View Example

**File:** `backend/medical_cases/views.py`

```python
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_medical_cases(request):
    # request.user is populated by CustomJWTAuthentication
    # request.user.role is the LATEST value from database

    user_role = getattr(request.user, 'role', None)

    if user_role != 'NORMAL_USER':
        return Response(
            {'detail': 'Only normal users can access this'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Fetch cases for authenticated user
    cases = MedicalCase.objects.filter(user=request.user)
    serializer = MedicalCaseSerializer(cases, many=True)
    return Response(serializer.data)
```

---

### 4. Frontend: Token Storage & Retrieval

**File:** `frontend/src/lib/auth.ts`

```typescript
// Store tokens on successful login
localStorage.setItem("jh_access_token", response.access);
localStorage.setItem("jh_refresh_token", response.refresh);
localStorage.setItem("jh_user_role", response.role); // ← Role stored separately
localStorage.setItem("jh_user_email", response.email);

// Retrieve token for API requests
function getAccessToken() {
  return localStorage.getItem("jh_access_token");
}

// Make authenticated request
fetch("/api/medical-cases/my-cases/", {
  headers: {
    Authorization: `Bearer ${getAccessToken()}`,
    "Content-Type": "application/json",
  },
});
```

---

## ⚙️ Role Normalization

**Backend stores:** `"NORMAL_USER"`, `"UNIVERSITY"`, `"ADMIN"`
**Frontend normalizes to:** `"user"`, `"university"`, `"admin"`

### Normalization Mapping

```
Backend          →  Frontend
─────────────────────────────
"NORMAL_USER"    →  "user"
"UNIVERSITY"     →  "university"
"ADMIN"          →  "admin"
```

### Where Normalization Happens

**Frontend `lib/auth.ts`:**

```typescript
const normalizeRole = (role: string) => {
  return role.toLowerCase().replace("normal_user", "user");
};
```

**Usage in components:**

```typescript
// Login response has role="NORMAL_USER"
localStorage.setItem("jh_user_role", normalizeRole(response.role));

// Dashboard checks for normalized role
if (userRole === "user") {
  /* allowed */
}
```

---

## 🚨 Common Errors & Solutions

### ERROR 1: "Given token not valid for any token type"

**Causes:**

1. ❌ Token modified after generation (signature broken)
2. ❌ Token generated with old SECRET_KEY, validated with new one
3. ❌ Token expired
4. ❌ Multiple instances of Django app with different SECRET_KEYs

**Solution:**

1. Check token was generated by current code (no modifications)
2. Verify SECRET_KEY in settings.py hasn't changed
3. Generate fresh token (old token may be expired)
4. Restart Django app with same SECRET_KEY

### ERROR 2: "Only normal users can access this"

**Causes:**

1. ❌ User logged in before role was assigned
2. ❌ User has UNIVERSITY email but role wasn't set to UNIVERSITY
3. ❌ Token loaded with old code before fix applied

**Solution:**

```bash
python manage.py fix_user_roles  # Reassign all roles
# User must login again to get fresh token
```

### ERROR 3: "Not authenticated"

**Causes:**

1. ❌ Token not being sent in header
2. ❌ Wrong header format
3. ❌ localStorage key is wrong

**Verify in DevTools Console:**

```javascript
const token = localStorage.getItem("jh_access_token");
fetch("/api/medical-cases/my-cases/", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
})
  .then((r) => r.json())
  .then((data) => console.log(data));
```

---

## 🧪 Debugging Checklist

Before reporting issues, verify:

- [ ] Token exists in localStorage

  ```javascript
  localStorage.getItem("jh_access_token");
  ```

- [ ] Token is valid (not expired)

  ```javascript
  const payload = atob(token.split(".")[1]);
  console.log(JSON.parse(payload));
  // Check exp > current_time
  ```

- [ ] Token is being sent to API
  - DevTools Network tab → Request headers → Authorization

- [ ] User has role in database

  ```python
  python manage.py shell
  from accounts.models import CustomUser
  user = CustomUser.objects.get(email='your@email')
  print(user.role)  # Should be NORMAL_USER, UNIVERSITY, or ADMIN
  ```

- [ ] Django is running with latest code
  - Check no syntax errors: `python manage.py check`
  - Check settings: `python manage.py shell; from django.conf import settings; print(settings.SECRET_KEY)`

- [ ] Frontend is using correct storage keys
  - Should be: `jh_access_token`, `jh_refresh_token`, `jh_user_role`, `jh_user_email`
  - NOT: `access_token`, `refresh_token`, `role`, `email`

---

## 📊 Token Lifecycle Flow

```
┌──────────────┐
│   Request    │  User sends HTTP request with Authorization header
└──────┬──────┘
       │ Bearer <token>
       ▼
┌──────────────────────────────┐
│  JWTAuthentication.authenticate() │
├──────────────────────────────┤
│ 1. Extract token             │
│ 2. Check signature (parent)  │
│ 3. Decode payload            │
│ 4. Get user_id from payload  │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  CustomJWTAuthentication     │
│  .authenticate()             │
├──────────────────────────────┤
│ 1. Call parent's auth        │
│ 2. Load user from database   │
│ 3. Refresh user data         │
│ 4. Set user.role from DB     │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  View (e.g., get_user_medical_cases)│
├──────────────────────────────┤
│ 1. Check request.user exists │
│ 2. Check request.user.role   │
│ 3. Return 403 if unauthorized│
│ 4. Process request if ok     │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────┐
│  Response    │
└──────────────┘
```

---

## 🔗 Related Files

### Frontend

- [Dashboard.tsx](frontend/src/pages/Dashboard.tsx) - Uses getAccessToken()
- [auth.ts](frontend/src/lib/auth.ts) - Token storage/retrieval
- [MedicalCaseForm.tsx](frontend/src/components/MedicalCaseForm.tsx) - API calls with token

### Backend

- [settings.py](backend/jeevandhara/settings.py) - REST_FRAMEWORK config with CustomJWTAuthentication
- [accounts/authentication.py](backend/accounts/authentication.py) - CustomJWTAuthentication class
- [accounts/serializers.py](backend/accounts/serializers.py) - CustomTokenObtainPairSerializer
- [accounts/models.py](backend/accounts/models.py) - CustomUser with role field
- [medical_cases/views.py](backend/medical_cases/views.py) - API views with role checks
- [medical_cases/permissions.py](backend/medical_cases/permissions.py) - Permission classes

---

## 🎯 Maintenance Notes

### When to Run fix_user_roles

- After adding new email to ApprovedUniversityEmail table
- After importing users from external source
- After major authentication system changes
- When deploying to production after code updates

### When to Regenerate Tokens

- After changing SECRET_KEY
- After security incident
- If you suspect token tampering
- User should logout and login again

### Best Practices

1. ✅ Always use parent's SimpleJWT methods for token generation
2. ✅ Never modify token payload after generation
3. ✅ Refresh user from database during authentication
4. ✅ Store sensitive data in database, not tokens
5. ✅ Use consistent storage keys across frontend
6. ✅ Test token flow after any authentication changes
