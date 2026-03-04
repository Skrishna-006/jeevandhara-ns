# `/api/send-otp/` Endpoint Fix - Summary

## Problem

The frontend was sending only an email field to the `/api/send-otp/` endpoint:

```json
{
  "email": "user@example.com"
}
```

But the backend was validating for `username` and `password`, causing this error:

```json
{
  "username": ["This field is required."],
  "password": ["This field is required."]
}
```

## Solution Implemented

### 1. Updated `SendOTPSerializer` ✅

**File**: `backend/accounts/serializers.py`

**Before**:

```python
class SendOTPSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        if CustomUser.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError("Username already taken")
        if CustomUser.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Email already registered")
        return data
```

**After**:

```python
class SendOTPSerializer(serializers.Serializer):
    """Serializer for OTP request - only requires email."""
    email = serializers.EmailField()
```

### 2. Updated `SendOTPView` ✅

**File**: `backend/accounts/views.py`

**Key Changes**:

- Only uses the `email` field from request
- Generates 6-digit OTP automatically
- Stores OTP record with email as username (placeholder)
- Prints OTP to console for development: `[OTP SENT] Email: xxx | OTP: 123456`
- Returns email in response for frontend confirmation

**Example Response**:

```json
{
  "message": "OTP sent (check console logs)",
  "email": "user@example.com"
}
```

## Verification Tests ✅

### Test 1: Valid Email Only

```
Status: 200
Response: {
  "message": "OTP sent (check console logs)",
  "email": "testuser@example.com"
}
Console: [OTP SENT] Email: testuser@example.com | OTP: 789069
```

### Test 2: Invalid Email (Validation Works)

```
Status: 400
Response: {
  "email": ["Enter a valid email address."]
}
```

### Test 3: Missing Email (Required Validation)

```
Status: 400
Response: {
  "email": ["This field is required."]
}
```

### Test 4: Username/Password NOT Required

```
Status: 200
Response: {
  "message": "OTP sent (check console logs)",
  "email": "another@example.com"
}
✓ Fields are NOT required anymore
```

### Test 5: Complete OTP Flow (Send → Verify)

```
✓ Send OTP endpoint works
✓ OTP code generated: 843598
✓ Verify OTP endpoint accepts the code
✓ User created successfully in database
✓ User role set to NORMAL_USER
```

## Frontend Usage

The frontend can now simply send:

```javascript
const payload = {
  email: "user@example.com",
};

const response = await fetch("http://localhost:8000/api/send-otp/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

const data = await response.json();
console.log(data.email); // Confirms which email received OTP
```

## Console Output Example

When OTP is sent, you'll see in the Django console:

```
[OTP SENT] Email: user@example.com | OTP: 482916
```

This is printed for development purposes so testers can see the OTP without needing email integration.

## Files Modified

1. **backend/accounts/serializers.py** - Updated SendOTPSerializer
2. **backend/accounts/views.py** - Updated SendOTPView

## Testing Scripts Created

- `backend/test_send_otp_fixed.py` - Tests the fixed endpoint
- `backend/test_otp_flow.py` - Tests complete send → verify flow

Run them with:

```bash
cd backend
python test_send_otp_fixed.py
python test_otp_flow.py
```

## Status

✅ **COMPLETE** - The `/api/send-otp/` endpoint now works correctly with only the email field.
