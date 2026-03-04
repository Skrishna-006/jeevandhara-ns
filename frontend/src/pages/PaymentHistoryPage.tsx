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
  studentName: string;
  amount: string;
  paymentDate: string;
  status: "Completed" | "Pending" | "Failed";
}

const PaymentHistoryPage = () => {
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "completed" | "pending" | "failed"
  >("all");

  // Static payment history data
  const allPayments: Payment[] = [
    {
      id: "PAY-001",
      studentName: "Rajesh Kumar",
      amount: "₹60,000",
      paymentDate: "2026-03-02",
      status: "Completed",
    },
    {
      id: "PAY-002",
      studentName: "Priya Sharma",
      amount: "₹45,000",
      paymentDate: "2026-03-01",
      status: "Completed",
    },
    {
      id: "PAY-003",
      studentName: "Ankit Verma",
      amount: "₹75,000",
      paymentDate: "2026-02-28",
      status: "Completed",
    },
    {
      id: "PAY-004",
      studentName: "Meera Singh",
      amount: "₹50,000",
      paymentDate: "2026-02-25",
      status: "Pending",
    },
    {
      id: "PAY-005",
      studentName: "Vikram Patel",
      amount: "₹55,000",
      paymentDate: "2026-02-20",
      status: "Completed",
    },
    {
      id: "PAY-006",
      studentName: "Neha Gupta",
      amount: "₹40,000",
      paymentDate: "2026-02-15",
      status: "Failed",
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Header Section */}
      <div className="border-b border-border bg-white mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Payment History
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and track all student payment records
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
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
          {(["all", "completed", "pending", "failed"] as const).map(
            (filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
                className="capitalize"
              >
                {filter === "all" ? "All Payments" : filter}
              </Button>
            ),
          )}
        </div>

        {/* Payment Table */}
        <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-sm">
                    Payment ID
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-sm">
                    Student Name
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-sm">
                    Amount
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-sm">
                    Payment Date
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
                      <td className="px-6 py-4 text-sm font-mono text-foreground">
                        {payment.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {payment.studentName}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">
                        {payment.amount}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(payment.paymentDate).toLocaleDateString(
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
                      colSpan={5}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No payments found for the selected filter.
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
    </div>
  );
};

export default PaymentHistoryPage;
