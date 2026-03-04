import {
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Payment {
  id: string;
  contributorName: string;
  amount: string;
  contributionDate: string;
  caseId: string;
  patientName: string;
  caseType: string;
  status: "Completed" | "Pending" | "Failed";
}

const PaymentHistoryPage = () => {
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "completed" | "pending" | "failed"
  >("all");

  // Static contribution data for cases
  const allPayments: Payment[] = [
    {
      id: "CON-001",
      contributorName: "Dr. Rajesh Kumar",
      amount: "₹25,000",
      contributionDate: "2026-03-03",
      caseId: "JD-2847",
      patientName: "Meena Devi",
      caseType: "Cardiac Surgery",
      status: "Completed",
    },
    {
      id: "CON-002",
      contributorName: "Prof. Priya Sharma",
      amount: "₹30,000",
      contributionDate: "2026-03-02",
      caseId: "JD-2846",
      patientName: "Ravi Kumar",
      caseType: "Orthopedic Treatment",
      status: "Completed",
    },
    {
      id: "CON-003",
      contributorName: "Admin Team",
      amount: "₹18,500",
      contributionDate: "2026-03-01",
      caseId: "JD-2845",
      patientName: "Anjali Verma",
      caseType: "Cancer Treatment",
      status: "Completed",
    },
    {
      id: "CON-004",
      contributorName: "Medical Department",
      amount: "₹22,000",
      contributionDate: "2026-02-28",
      caseId: "JD-2844",
      patientName: "Vikram Patel",
      caseType: "Neurosurgery",
      status: "Completed",
    },
    {
      id: "CON-005",
      contributorName: "Student Committee",
      amount: "₹15,000",
      contributionDate: "2026-02-25",
      caseId: "JD-2843",
      patientName: "Sneha Gupta",
      caseType: "Organ Transplant",
      status: "Pending",
    },
    {
      id: "CON-006",
      contributorName: "Finance Office",
      amount: "₹20,000",
      contributionDate: "2026-02-20",
      caseId: "JD-2842",
      patientName: "Arjun Singh",
      caseType: "Pediatric Care",
      status: "Completed",
    },
  ];

  // Filter payments based on selected filter
  const filteredPayments =
    selectedFilter === "all" ? allPayments : (
      allPayments.filter((p) => p.status.toLowerCase() === selectedFilter)
    );

  // Calculate statistics
  const totalPayments = allPayments.length;
  const completedPayments = allPayments.filter(
    (p) => p.status === "Completed",
  ).length;
  const totalAmount = allPayments
    .reduce((sum, p) => {
      const amount = parseInt(p.amount.replace(/[₹,]/g, ""));
      return sum + amount;
    }, 0)
    .toLocaleString("en-IN");

  // Status color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-success/10 text-success";
      case "Pending":
        return "bg-accent/10 text-accent";
      case "Failed":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <ArrowDownLeft className="w-4 h-4" />;
      case "Pending":
        return <Calendar className="w-4 h-4" />;
      case "Failed":
        return <ArrowUpRight className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Total Payments
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {totalPayments}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-accent" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            All recorded transactions
          </p>
        </div>

        <div className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Completed
              </p>
              <p className="text-3xl font-bold text-success mt-2">
                {completedPayments}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
              <ArrowDownLeft className="w-6 h-6 text-success" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Successfully processed
          </p>
        </div>

        <div className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-muted-foreground font-medium">
                Total Amount
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                ₹{totalAmount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Total disbursed funds
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        {(["all", "completed", "pending", "failed"] as const).map((filter) => (
          <Button
            key={filter}
            variant={selectedFilter === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(filter)}
            className="capitalize"
          >
            {filter === "all" ? "All Contributions" : filter}
          </Button>
        ))}
      </div>

      {/* Contributions Table */}
      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-sm">
                  Case ID
                </th>
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-sm">
                  Patient Name
                </th>
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-sm">
                  Case Type
                </th>
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-sm">
                  Contributor
                </th>
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-sm">
                  Amount
                </th>
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-sm">
                  Date
                </th>
                <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-sm">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ?
                filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-foreground font-semibold">
                      {payment.caseId}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      {payment.patientName}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {payment.caseType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {payment.contributorName}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      {payment.amount}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(payment.contributionDate).toLocaleDateString(
                        "en-IN",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          payment.status,
                        )}`}
                      >
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </div>
                    </td>
                  </tr>
                ))
              : <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No contributions found for the selected filter.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Button */}
      <div className="mt-8 flex justify-end gap-3">
        <Button variant="outline">Export CSV</Button>
        <Button className="bg-primary text-primary-foreground">
          Generate Report
        </Button>
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
