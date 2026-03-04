# OTP Verification System - Cache-Based Implementation

## Changes Made

### Problem

The OTP verification system had unreliable database operations that caused:

- OTP verification to fail even with correct codes
- No proper expiration handling
- Database dependency for time-sensitive data

### Solution

Switched from database-based OTP storage to Django's **cache system** with proper validation.

## Implementation Details

### 1. **SendOTPView** (Updated)

**File**: `backend/accounts/views.py`

**Changes**:

- ✅ Generate 6-digit OTP: `random.randint(100000, 999999)`
- ✅ Store in Django cache with 5-minute expiry: `cache.set(email, otp, timeout=300)`
- ✅ Print to console: `[OTP SENT] Email: xxx | OTP: 123456`
- ✅ Returns email in response

**Request**:

```json
{
  "email": "user@example.com"
}
```

**Response**:

```json
{
  "message": "OTP sent (check console logs)",
  "email": "user@example.com"
}
```

**Console Output**:

```
[OTP SENT] Email: user@example.com | OTP: 537271 | Expires: 5 minutes
```

---

### 2. **VerifyOTPView** (Updated)

**File**: `backend/accounts/views.py`

**Changes**:

- ✅ Get OTP from cache: `cache.get(email)`
- ✅ String comparison: `str(stored_otp) != str(entered_otp)`
- ✅ Delete OTP after verification: `cache.delete(email)`
- ✅ Proper error handling for expired/missing OTP
- ✅ Debug prints for troubleshooting
- ✅ Create user on successful verification

**Request**:

```json
{
  "email": "user@example.com",
  "otp": "537271"
}
```

**Response (Success)**:

```json
{
  "message": "OTP verified successfully",
  "email": "user@example.com"
}
```

**Response (Error - Invalid OTP)**:

```json
{
  "error": "Invalid OTP"
}
```

**Response (Error - Expired OTP)**:

```json
{
  "error": "OTP expired or not found. Please request a new OTP."
}
```

**Debug Output**:

```
[DEBUG] Stored OTP: 537271
[DEBUG] Entered OTP: 537271
[DEBUG] OTP verified successfully for user@example.com
[DEBUG] User created: user@example.com
[DEBUG] OTP deleted from cache
```

---

### 3. **VerifyOTPSerializer** (Updated)

**File**: `backend/accounts/serializers.py`

**Changes**:

- ✅ Removed database validation logic
- ✅ Only validates email and OTP field format
- ✅ Minimum length 6, maximum length 6 for OTP

```python
class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)
```

---

## Import Changes

Added to `backend/accounts/views.py`:

```python
from django.core.cache import cache
```

---

## Test Results ✅

### Test 1: Correct OTP Verification

- ✅ OTP stored in cache
- ✅ Verification succeeds with correct code
- ✅ User created after verification
- ✅ OTP deleted from cache

### Test 2: Wrong OTP

- ✅ Returns 400 with "Invalid OTP" message
- ✅ Does not create user
- ✅ OTP remains in cache for retry

### Test 3: Expired OTP

- ✅ Cache timeout after 5 minutes works
- ✅ Returns 400 with "OTP expired" message
- ✅ Prompts user to request new OTP

### Test 4: Missing Fields

- ✅ Returns 400 for missing email
- ✅ Returns 400 for missing OTP
- ✅ Clear error messages

---

## Django Cache Configuration

The implementation uses Django's default cache configuration. If not explicitly configured, it uses **local memory cache**.

**Current Setting** (backend/jeevandhara/settings.py):

```python
# Default: Local memory cache (LocMemCache)
# For production, use Redis or Memcached
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}
```

---

## Workflow

```
1. Frontend calls /api/send-otp/ with email
   ↓
2. Backend generates OTP, stores in cache (5-min timeout)
   ↓
3. Backend prints OTP to console: [OTP SENT] xxxx
   ↓
4. User enters OTP in frontend
   ↓
5. Frontend calls /api/verify-otp/ with email + OTP
   ↓
6. Backend retrieves from cache, compares strings
   ↓
7a. If match: Create user, delete OTP, return 200
7b. If no match: Return 400 error, keep OTP for retry
```

---

## Files Modified

1. **backend/accounts/views.py**
   - Updated `SendOTPView` (cache-based storage)
   - Updated `VerifyOTPView` (cache-based verification)
   - Added import: `from django.core.cache import cache`

2. **backend/accounts/serializers.py**
   - Updated `VerifyOTPSerializer` (removed DB validation)

---

## Testing

Run comprehensive tests:

```bash
cd backend
python test_cache_otp.py
```

Expected output:

```
✅ ALL TESTS PASSED!
```

---

## Benefits of Cache-Based Approach

| Feature     | Database       | Cache             |
| ----------- | -------------- | ----------------- |
| Speed       | Slower         | ✅ Faster         |
| Expiration  | Manual cleanup | ✅ Automatic      |
| Complexity  | Higher         | ✅ Simpler        |
| Reliability | DB dependency  | ✅ Independent    |
| Debugging   | Query logs     | ✅ Console prints |

---

## Status

**✅ COMPLETE** - OTP verification system now uses cache with proper timeout, string comparison, and debug logging.
