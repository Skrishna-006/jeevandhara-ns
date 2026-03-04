# 🎓 UNIVERSITY DASHBOARD - DEVELOPER REFERENCE CARD

## 🔗 FILE LOCATIONS

```
frontend/src/pages/
├── UniversityPortal.tsx          (508 lines) - Main layout + login
├── UniversityDashboardPage.tsx   (235 lines) - Dashboard overview
├── PaymentHistoryPage.tsx        (313 lines) - Contributions tracker ⭐
├── PatientReportsPage.tsx        (451 lines) - Case reports
└── ProfilePage.tsx               (435 lines) - Profile management

frontend/src/
├── App.tsx                       - Routes configuration
└── lib/
    └── auth.ts                   - Auth utilities
```

---

## 🛣️ ROUTING REFERENCE

```typescript
// App.tsx routes (all protected with requiredRole="university")
/university              → UniversityPortal (Login form)
/university-dashboard   → UniversityDashboardPage
/university-payments    → PaymentHistoryPage  ⭐ Main feature
/university-reports     → PatientReportsPage
/university-profile     → ProfilePage

// Sidebar navigation in UniversityPortal
navigate("/university-dashboard")
navigate("/university-payments")
navigate("/university-reports")
navigate("/university-profile")
```

---

## 🔐 AUTHENTICATION REFERENCE

```typescript
// Demo credentials
University ID: UNI-2024-0001
Password: admin123

// Session keys (localStorage)
jh_uni_logged_in    // Session flag
jh_uni_id           // University ID

// Protected route usage
<ProtectedRoute path="/university-*" requiredRole="university" />
```

---

## 📊 PAYMENTHISTORYPAGE - KEY CODE SNIPPETS

### Data Interface

```typescript
interface Payment {
  id: string; // "CON-001"
  contributorName: string; // Organization name
  amount: string; // "₹25,000"
  contributionDate: string; // "2026-03-03"
  caseId: string; // "JD-2847" ⭐ Case linkage
  patientName: string; // "Meena Devi" ⭐ Patient visibility
  caseType: string; // "Cardiac Surgery"
  status: "Completed" | "Pending" | "Failed";
}
```

### Statistics Calculation

```typescript
const totalContributions = allPayments.length; // 6
const completedCount = allPayments.filter(
  (p) => p.status === "Completed",
).length; // 4
const totalAmount = "₹1,27,500"; // Calculated sum
```

### Table Columns (7 Total)

```tsx
<TableHead>Case ID</TableHead>           // Bold, links to case
<TableHead>Patient Name</TableHead>      // Patient needing help
<TableHead>Case Type</TableHead>         // Colored badge
<TableHead>Contributor</TableHead>       // Organization that gave
<TableHead>Amount</TableHead>            // Contribution in ₹
<TableHead>Date</TableHead>              // YYYY-MM-DD format
<TableHead>Status</TableHead>            // Icon + text
```

### Filtering Logic

```typescript
const [selectedFilter, setSelectedFilter] = useState<
  "all" | "completed" | "pending" | "failed"
>("all");

const filteredPayments = allPayments.filter((payment) => {
  if (selectedFilter === "all") return true;
  return payment.status.toLowerCase() === selectedFilter;
});
```

---

## 🎨 LAYOUT REFERENCE

### Sidebar Layout (UniversityPortal)

```tsx
<div className="flex min-h-screen">
  {/* Sidebar: Fixed width */}
  <aside className="w-64 bg-slate-50 ...">
    <nav>{/* 4 navigation buttons */}</nav>
  </aside>

  {/* Main Content: Flex fill */}
  <main className="flex-1 p-8 bg-white">{/* Page content renders here */}</main>
</div>
```

### Page Wrapper Pattern (All 4 pages)

```tsx
return <div className="space-y-8 w-full">{/* Page content */}</div>;
```

---

## 🎯 QUICK CODE EXAMPLES

### Adding A Navigation Button

```tsx
<button
  onClick={() => navigate("/university-payments")}
  className="w-full text-left px-4 py-2 rounded hover:bg-slate-200"
>
  💳 Payments
</button>
```

### Creating A Statistics Card

```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">6</div>
    <p className="text-xs text-muted-foreground">All recorded contributions</p>
  </CardContent>
</Card>
```

### Filtering Data

```tsx
const filteredData = allPayments.filter((payment) => {
  if (selectedFilter === "all") return true;
  return payment.status === selectedFilter;
});
```

### Table Row with Case Linkage

```tsx
<TableRow>
  <TableCell className="font-bold">{payment.caseId}</TableCell>
  <TableCell>{payment.patientName}</TableCell>
  <TableCell>
    <Badge>{payment.caseType}</Badge>
  </TableCell>
  <TableCell>{payment.contributorName}</TableCell>
  <TableCell>{payment.amount}</TableCell>
  <TableCell>{payment.contributionDate}</TableCell>
  <TableCell>{payment.status}</TableCell>
</TableRow>
```

---

## 🧪 TESTING QUICK CHECKLIST

```
☐ Login works: UNI-2024-0001 / admin123
☐ Dashboard page loads (/university-dashboard)
☐ Payments page shows 6 contributions (/university-payments) ⭐
☐ Reports page works (/university-reports)
☐ Profile page works (/university-profile)
☐ Sidebar navigation functional
☐ Filters work (All, Completed, Pending, Failed)
☐ White background visible
☐ No console errors
☐ URLs use /university-* format
```

---

## 🐛 DEBUGGING TIPS

### Check Current Page

```typescript
// In UniversityPortal.tsx
const pathname = location.pathname;
console.log("Current path:", pathname);

if (pathname.includes("university-dashboard")) {
  console.log("On dashboard page");
}
```

### Verify Data Loading

```typescript
// In PaymentHistoryPage.tsx
console.log("All payments:", allPayments);
console.log("Filtered payments:", filteredPayments);
console.log("Selected filter:", selectedFilter);
```

### Check Session

```typescript
const session = JSON.parse(localStorage.getItem("jh_uni_logged_in") || "false");
console.log("Session:", session);
```

---

## 🔄 COMMON MODIFICATIONS

### Add New Contribution Status

```typescript
// 1. Update interface
status: "Completed" | "Pending" | "Failed" | "NEW_STATUS";

// 2. Add filter option
const [selectedFilter, setSelectedFilter] = useState<
  "all" | "completed" | "pending" | "failed" | "new_status"
>("all");

// 3. Add filter button
<Button onClick={() => setSelectedFilter("new_status")}>
  New Status
</Button>
```

### Add New Field to Contribution

```typescript
// 1. Update interface
interface Payment {
  // ... existing fields
  newField: string;  // NEW
}

// 2. Add to sample data
{
  id: "CON-001",
  // ... existing data
  newField: "value",  // NEW
}

// 3. Add to table
<TableHead>New Field</TableHead>  // In header
<TableCell>{payment.newField}</TableCell>  // In row
```

### Change Table Column Order

```tsx
// Just reorder the <TableCell> elements in the render
<TableRow>
  <TableCell>{payment.newField}</TableCell> // Moved to first
  <TableCell className="font-bold">{payment.caseId}</TableCell>
  <TableCell>{payment.patientName}</TableCell>
  // ... rest
</TableRow>
```

---

## 📱 RESPONSIVE CONSIDERATIONS

### Currently Optimized For

- Desktop (1920px+): All columns visible
- Tablet (768px+): Table scrolls horizontally
- Mobile: Not yet optimized (roadmap)

### Make Mobile Responsive (Future)

```tsx
// Hide columns on mobile
<TableCell className="hidden md:table-cell">
  {payment.caseType}
</TableCell>

// Stack layout on mobile
<div className="flex flex-col md:flex-row">
  {/* Content */}
</div>
```

---

## 🚀 PERFORMANCE NOTES

### Current Implementation

- Static sample data (6 records)
- No API calls
- Instant filtering
- No loading states needed

### When Connected to API

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchContributions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/contributions");
      const data = await response.json();
      setAllPayments(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  fetchContributions();
}, []);
```

---

## 💾 STATE MANAGEMENT REFERENCE

### Current: React Hooks (useState)

```typescript
const [selectedFilter, setSelectedFilter] = useState("all");
const [isEditing, setIsEditing] = useState(false);
```

### Future: Context API or Redux

For complex state sharing across pages

---

## 🎯 DEVELOPER WORKFLOW

### Daily Development

```bash
# Start servers
cd backend && python manage.py runserver    # Terminal 1
cd frontend && npm run dev                  # Terminal 2

# Watch for changes
# Frontend: Auto-reloads on file save
# Backend: Auto-restarts on file save

# Test endpoint
curl http://localhost:8080/university-payments
```

### Code Changes

```
1. Edit frontend/src/pages/PaymentHistoryPage.tsx
2. Save file (auto-reload)
3. Check browser console for errors
4. Test filtering and data display
```

### Git Workflow

```bash
git add frontend/src/pages/PaymentHistoryPage.tsx
git commit -m "feat: update contribution tracking"
git push origin feature/university-dashboard
```

---

## 📖 IMPORT STATEMENTS (Copy-Paste)

```typescript
// Required imports for PaymentHistoryPage
import {
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
```

---

## 🔗 RELATED COMMANDS

```bash
# Check TypeScript errors
npm run build

# Run linter
npm run lint

# Format code
npm run format

# Type check
npx tsc --noEmit
```

---

## 📊 DATA SCHEMA QUICK REFERENCE

```json
{
  "contributions": [
    {
      "id": "CON-001",
      "caseId": "JD-2847",
      "patientName": "Meena Devi",
      "caseType": "Cardiac Surgery",
      "contributorName": "Dr. Rajesh Kumar",
      "amount": "₹25,000",
      "contributionDate": "2026-03-03",
      "status": "Completed"
    }
  ],
  "statistics": {
    "totalContributions": 6,
    "completedCount": 4,
    "pendingCount": 1,
    "failedCount": 1,
    "totalAmount": "₹1,27,500"
  }
}
```

---

## ⚡ QUICK TIPS

1. **Case IDs** always in format: JD-XXXX
2. **Amounts** formatted: ₹X,XXX
3. **Dates** in format: YYYY-MM-DD
4. **Status** limited to: Completed, Pending, Failed
5. **Navigation** all use /university-\* format
6. **Wrap main content** in space-y-8 w-full div
7. **Use bg-white** for main content area
8. **Import from @/components** (alias set in tsconfig)

---

## 🎓 LEARNING RESOURCES

- React Router v6 Docs: https://reactrouter.com
- Tailwind CSS Docs: https://tailwindcss.com
- lucide-react Icons: https://lucide.dev
- TypeScript Handbook: https://www.typescriptlang.org/docs

---

**Bookmark This**: UNIVERSITY_DASHBOARD_DEVELOPER_REFERENCE.md  
**Last Updated**: March 2026  
**Version**: 1.0 (Production Ready)
