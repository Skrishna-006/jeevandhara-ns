# 🚀 QUICK REFERENCE CARD

## Problem: "Given token not valid for any token type"

### ⚡ 30-Second Fix

```bash
# Terminal 1: Backend
cd backend
python quick_setup.py

# Terminal 2: Frontend browser
1. Press F12 (DevTools)
2. Local Storage → Delete all "jh_*" items
3. Go to http://localhost:5173/login
4. Login as: normaluser@example.com / Test@123
5. Check Dashboard → Cases should load
```

---

## Problem: "User has no role assigned"

### ⚡ One Command Fix

```bash
cd backend
python manage.py fix_user_roles
```

---

## Problem: "Still seeing token error after above steps"

### ⚡ Diagnostic Tool

```bash
cd backend
python test_token_flow.py
```

Share the output - it will show exactly what's failing.

---

## Problem: "Want to understand how it works"

### ⚡ Read These Files (in order)

1. [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) (5 min)
2. [TOKEN_VALIDATION_TESTING_GUIDE.md](TOKEN_VALIDATION_TESTING_GUIDE.md) (10 min)
3. [JWT_TOKEN_SYSTEM_ARCHITECTURE.md](JWT_TOKEN_SYSTEM_ARCHITECTURE.md) (20 min)

---

## Backend Commands Reference

```bash
# In backend/ directory

# Setup everything at once
python quick_setup.py

# Run all migrations
python manage.py migrate

# Assign roles to users
python manage.py fix_user_roles

# Test token flow
python test_token_flow.py

# Access database shell
python manage.py shell

# Check for errors
python manage.py check

# Start server
python manage.py runserver
```

---

## Browser Console Tricks (F12)

```javascript
// Check tokens
localStorage.getItem("jh_access_token")?.substring(0, 50);

// Check role
localStorage.getItem("jh_user_role");

// Clear all auth data
Object.keys(localStorage).forEach(
  (k) => k.startsWith("jh_") && localStorage.removeItem(k),
);

// Test API manually
const token = localStorage.getItem("jh_access_token");
fetch("http://localhost:8000/api/medical-cases/my-cases/", {
  headers: { Authorization: `Bearer ${token}` },
})
  .then((r) => r.json())
  .then((d) => console.log(d))
  .catch((e) => console.error(e));
```

---

## Test Credentials

Created by `python quick_setup.py`:

| Email                  | Password | Role        | Purpose        |
| ---------------------- | -------- | ----------- | -------------- |
| normaluser@example.com | Test@123 | NORMAL_USER | Register cases |
| hospital@example.com   | Test@123 | HOSPITAL    | Hospital view  |
| university@example.com | Test@123 | UNIVERSITY  | Funding view   |

---

## Expected vs Actual

### ✅ EXPECTED (Working)

```
✓ Login successful
✓ Tokens in localStorage
✓ Dashboard loads in < 2 sec
✓ "Your Uploaded Cases" displays
✓ No errors in browser console
✓ [DEBUG] messages in Django terminal
```

### ❌ ACTUAL (When Broken)

```
✗ Login stalls
✗ No tokens in localStorage
✗ Dashboard shows loading forever
✗ Red error message on Dashboard
✗ Browser console shows 401/403 error
✗ Django terminal shows "not valid" error
```

---

## Files That Got Fixed

### Backend

- `accounts/serializers.py` - Token generation simplified
- `accounts/authentication.py` - Role loaded from database
- NEW: `accounts/management/commands/fix_user_roles.py`
- NEW: `quick_setup.py`
- NEW: `test_token_flow.py`

### Frontend

- NO CHANGES NEEDED (existing code already correct)

### New Documentation

- `IMPLEMENTATION_COMPLETE.md` (this package)
- `TOKEN_VALIDATION_TESTING_GUIDE.md` (detailed steps)
- `JWT_TOKEN_SYSTEM_ARCHITECTURE.md` (technical details)

---

## 3-Step Solution Path

### If you just want it working NOW:

1. Run: `python quick_setup.py` ← Does everything
2. Clear browser: Delete localStorage "jh\_\*" items
3. Login: `normaluser@example.com` / `Test@123`

### If you want to understand what happened:

1. Read: `IMPLEMENTATION_COMPLETE.md` (5 min, explains fix)
2. Read: `TOKEN_VALIDATION_TESTING_GUIDE.md` (10 min, explains testing)
3. Read: `JWT_TOKEN_SYSTEM_ARCHITECTURE.md` (20 min, deep dive)

### If something is still broken:

1. Run: `python test_token_flow.py` (10 sec, diagnoses issue)
2. Check: Output will tell you exactly what failed
3. Follow: The matching section in `TOKEN_VALIDATION_TESTING_GUIDE.md`

---

## The One Thing to Remember

**DON'T modify JWT tokens after generation.**

That's what broke everything. That's what we fixed.

The new approach:

- Generate standard tokens ✓
- Load role from database ✓
- Everything works ✓

---

## Emergency Contact Info

### If completely stuck:

**Run this diagnostic:**

```bash
cd backend
python test_token_flow.py 2>&1 | tee diagnostic_output.txt
```

**Then provide:**

1. The entire output from above
2. Error from browser console (F12)
3. Error from Django terminal
4. What you were trying to do

**That's all we need to help!**

---

## Last Updated

After Token Validation Fixes (Complete Restructuring)

- Token generation: Simplified (no modification)
- Token validation: Uses database roles
- Management command: Added for role assignment
- Testing tools: Added for diagnosis

---

**You've got this! 🚀**

Go ahead and run `python quick_setup.py` - it will walk you through everything.
