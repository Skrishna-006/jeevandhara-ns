# University Dashboard - Quick Test Guide

## 🚀 TESTING CHECKLIST

### ✅ Pre-Test Setup

- [ ] Backend running on http://localhost:8000
- [ ] Frontend development server running on http://localhost:8080
- [ ] Browser opened to http://localhost:8080/university

---

## 📋 TEST SCENARIOS

### 1. LOGIN PAGE

**URL**: http://localhost:8080/university

**Demo Credentials**:

- University ID: `UNI-2024-0001`
- Password: `admin123`

**Expected Result**:

- [ ] Form displays with University ID and Password fields
- [ ] Login button is clickable
- [ ] Demo credentials are accepted
- [ ] User logged in and redirected to dashboard

---

### 2. DASHBOARD PAGE

**URL**: http://localhost:8080/university-dashboard

**Test Cases**:

1. **Metrics Cards**
   - [ ] Total Contributions card shows: ₹2,50,00,000
   - [ ] Patients Supported card shows: 245
   - [ ] Active Campaigns card shows: 18
   - [ ] Students Participating card shows: 1840

2. **Monthly Contributions Section**
   - [ ] Shows: ₹12,50,000 this month
   - [ ] Trend indicator shows: +8.5%
   - [ ] Styling is clear and readable

3. **Recent Activity Feed**
   - [ ] Shows 5 recent activities
   - [ ] Each activity has: icon, description, details, timestamp
   - [ ] Activities include: contribution, approval, patient information

4. **Layout**
   - [ ] Sidebar visible on left (w-64)
   - [ ] Main content has white background
   - [ ] No full-page styling conflicts
   - [ ] Content fills available space correctly

---

### 3. PAYMENTS (CONTRIBUTION HISTORY) PAGE

**URL**: http://localhost:8080/university-payments

**Test Cases**:

1. **Statistics Cards**
   - [ ] Total Contributions shows: 6 records
   - [ ] Completed shows: 4 completed records
   - [ ] Total Amount Disbursed shows: ₹1,27,500

2. **Filter Buttons**
   - [ ] "All Contributions" button shows all 6 records
   - [ ] "Completed" filter shows 4 records
   - [ ] "Pending" filter shows 1 record
   - [ ] "Failed" filter shows 1 record

3. **Contribution Data Display**
   - [ ] Table shows 7 columns:
     1. Case ID (bold, e.g., "JD-2847")
     2. Patient Name (e.g., "Meena Devi")
     3. Case Type (colored badge, e.g., "Cardiac Surgery")
     4. Contributor (e.g., "Dr. Rajesh Kumar")
     5. Amount (e.g., "₹25,000")
     6. Date (e.g., "2026-03-03")
     7. Status (icon + text)

4. **Sample Contributions to Verify**:

   ```
   JD-2847 | Meena Devi | Cardiac Surgery | Dr. Rajesh Kumar | ₹25,000 | 2026-03-03 | Completed
   JD-2846 | Ravi Kumar | Orthopedic Treatment | Prof. Priya Sharma | ₹30,000 | 2026-03-02 | Completed
   JD-2845 | Anjali Verma | Cancer Treatment | Admin Team | ₹18,500 | 2026-03-01 | Completed
   JD-2844 | Vikram Patel | Neurosurgery | Medical Department | ₹22,000 | 2026-02-28 | Pending
   JD-2843 | Sneha Singh | Kidney Transplant | Dr. Rajesh Kumar | ₹20,000 | 2026-02-27 | Completed
   JD-2842 | Arjun Reddy | Burn Treatment | Admin Team | ₹12,000 | 2026-02-26 | Failed
   ```

5. **Layout & Display**
   - [ ] Table scrolls horizontally if needed
   - [ ] All 7 columns visible and properly aligned
   - [ ] White background fills main content area
   - [ ] Sidebar navigation visible

---

### 4. REPORTS PAGE

**URL**: http://localhost:8080/university-reports

**Test Cases**:

1. **Statistics Cards**
   - [ ] Total Reports shows a number
   - [ ] Approved count displays
   - [ ] Under Review count displays

2. **Filter Buttons**
   - [ ] "All Reports" shows all reports
   - [ ] "Approved" shows only approved reports
   - [ ] "Pending" shows pending reports
   - [ ] "Under Review" shows in-review reports

3. **Reports Table**
   - [ ] Shows columns: Report ID, Patient Name, Hospital, Case Type, Report Date, Status, Actions
   - [ ] Sample reports display (6 records)
   - [ ] "View" button is clickable
   - [ ] "Download" button is clickable

4. **Modal Popup (Click "View")**
   - [ ] Detail modal opens with report information
   - [ ] Shows: Report title, content, date generated
   - [ ] Has "Download" and "Print" buttons
   - [ ] Can be closed with X button or outside click

5. **Layout**
   - [ ] Table properly formatted
   - [ ] Scrollable if needed
   - [ ] White background visible
   - [ ] Sidebar accessible

---

### 5. PROFILE PAGE

**URL**: http://localhost:8080/university-profile

**Test Cases**:

1. **View Mode (Initial)**
   - [ ] Organization name displays: "Dr. Ambedkar Institute of Medical Sciences"
   - [ ] Admin name displays: "Dr. Rajesh Kumar Sharma"
   - [ ] All profile fields visible:
     - Administrator
     - Email
     - Phone
     - Address
     - Website
     - Established
     - Accreditation

2. **Edit Mode**
   - [ ] "Edit" button visible and clickable
   - [ ] After clicking Edit:
     - [ ] "Edit" button changes to "Save" and "Cancel"
     - [ ] All fields become editable (inputs)
     - [ ] Current values pre-filled in inputs

3. **Save Changes**
   - [ ] Click "Save" button
   - [ ] Fields become read-only again
   - [ ] Values are preserved
   - [ ] "Edit" button reappears

4. **Cancel Edit**
   - [ ] Click "Edit" to enter edit mode
   - [ ] Change some values
   - [ ] Click "Cancel"
   - [ ] Fields revert to view mode
   - [ ] Original values are restored

5. **Layout**
   - [ ] Profile section clearly formatted
   - [ ] Fields properly labeled
   - [ ] White background visible
   - [ ] Sidebar navigation accessible

---

### 6. NAVIGATION & ROUTING

**Test Cases**:

1. **Sidebar Navigation**
   - [ ] Click "Dashboard" → URL becomes `/university-dashboard`
   - [ ] Click "Payments" → URL becomes `/university-payments`
   - [ ] Click "Reports" → URL becomes `/university-reports`
   - [ ] Click "Profile" → URL becomes `/university-profile`

2. **URL Synchronization**
   - [ ] Current page button highlighted in sidebar
   - [ ] Navigating by URL directly (e.g., http://localhost:8080/university-payments) loads correct page
   - [ ] Back/forward browser buttons work correctly

3. **Logout**
   - [ ] Click logout button (if visible)
   - [ ] User redirected to `/university` login page
   - [ ] Session cleared from localStorage

---

### 7. STYLING & LAYOUT

**Test Cases**:

1. **Overall Layout**
   - [ ] Sidebar consistently visible (w-64, bg-slate-50)
   - [ ] Main content area has white background (bg-white)
   - [ ] Proper spacing between elements (space-y-8)
   - [ ] No page overflow issues

2. **Responsive Elements**
   - [ ] Tables scroll on smaller screens
   - [ ] Cards stack appropriately
   - [ ] Text is readable
   - [ ] Buttons are clickable

3. **Visual Consistency**
   - [ ] All pages use same header styling
   - [ ] All pages use same card styling
   - [ ] All pages use same table styling
   - [ ] Sidebar styling consistent across all pages

---

## 🐛 COMMON ISSUES TO CHECK

| Issue                     | How to Test                | Expected Result                         |
| ------------------------- | -------------------------- | --------------------------------------- |
| Login fails               | Use incorrect password     | Error message displayed                 |
| URL not updating          | Click sidebar button       | URL changes to /university-\*           |
| White background missing  | Look at main content area  | White background visible                |
| Sidebar hidden            | Navigate to any page       | Sidebar always visible                  |
| Page content overflow     | Check table scrolling      | Content scrolls without breaking layout |
| Filters not working       | Click filter buttons       | Table data updates accordingly          |
| Modal closes unexpectedly | Open modal on Reports page | Modal stays open until closed           |

---

## ✅ SUCCESS CRITERIA

**All Tests Pass When:**

1. ✅ Login works with demo credentials (UNI-2024-0001 / admin123)
2. ✅ All 4 pages load without errors
3. ✅ Dashboard displays metrics and activity correctly
4. ✅ Payments shows case-specific contributions with all 7 columns
5. ✅ Reports shows table with modal viewer functionality
6. ✅ Profile shows university info with edit capabilities
7. ✅ Sidebar navigation works between all pages
8. ✅ URLs use hyphenated format (/university-\*)
9. ✅ White background visible in main content area
10. ✅ No console errors in browser dev tools

---

## 📊 TEST SUMMARY TEMPLATE

```
Date: ___________
Tester: _________

✅ PASSED / ❌ FAILED

Page Tests:
- Dashboard: ___  / ___
- Payments: ___  / ___
- Reports: ___  / ___
- Profile: ___  / ___

Feature Tests:
- Navigation: ✅ / ❌
- Filtering: ✅ / ❌
- Modals: ✅ / ❌
- Edit Mode: ✅ / ❌

Layout Tests:
- White Background: ✅ / ❌
- Sidebar Visible: ✅ / ❌
- Responsive: ✅ / ❌
- Spacing: ✅ / ❌

Issues Found:
1. ______________________
2. ______________________
3. ______________________

Notes:
______________________
______________________
```

---

**Dashboard Ready for Testing**: http://localhost:8080/university
