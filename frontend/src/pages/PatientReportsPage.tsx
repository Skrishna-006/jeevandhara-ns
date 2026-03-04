import {
  FileText,
  Eye,
  Download,
  Filter,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PatientReport {
  id: string;
  reportId: string;
  patientName: string;
  hospital: string;
  reportDate: string;
  status: "Approved" | "Pending" | "Under Review";
  caseType: string;
}

const PatientReportsPage = () => {
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "approved" | "pending" | "review"
  >("all");
  const [viewingReport, setViewingReport] = useState<string | null>(null);

  // Static patient reports data
  const allReports: PatientReport[] = [
    {
      id: "1",
      reportId: "RPT-2026-001",
      patientName: "Rajesh Kumar",
      hospital: "AIIMS Delhi",
      reportDate: "2026-03-01",
      status: "Approved",
      caseType: "Cardiac Surgery",
    },
    {
      id: "2",
      reportId: "RPT-2026-002",
      patientName: "Priya Sharma",
      hospital: "Max Healthcare",
      reportDate: "2026-02-28",
      status: "Approved",
      caseType: "Orthopedic Treatment",
    },
    {
      id: "3",
      reportId: "RPT-2026-003",
      patientName: "Ankit Verma",
      hospital: "Fortis Hospital",
      reportDate: "2026-02-25",
      status: "Under Review",
      caseType: "Neurosurgery",
    },
    {
      id: "4",
      reportId: "RPT-2026-004",
      patientName: "Meera Singh",
      hospital: "Apollo Hospital",
      reportDate: "2026-02-23",
      status: "Pending",
      caseType: "Cancer Treatment",
    },
    {
      id: "5",
      reportId: "RPT-2026-005",
      patientName: "Vikram Patel",
      hospital: "CMC Vellore",
      reportDate: "2026-02-20",
      status: "Approved",
      caseType: "Organ Transplant",
    },
    {
      id: "6",
      reportId: "RPT-2026-006",
      patientName: "Neha Gupta",
      hospital: "AIIMS Delhi",
      reportDate: "2026-02-18",
      status: "Under Review",
      caseType: "Pediatric Care",
    },
  ];

  // Filter reports based on selected status
  const filteredReports =
    selectedStatus === "all" ? allReports : (
      allReports.filter((r) => {
        if (selectedStatus === "approved") return r.status === "Approved";
        if (selectedStatus === "pending") return r.status === "Pending";
        if (selectedStatus === "review") return r.status === "Under Review";
        return true;
      })
    );

  // Calculate statistics
  const totalReports = allReports.length;
  const approvedReports = allReports.filter(
    (r) => r.status === "Approved",
  ).length;
  const pendingReports = allReports.filter(
    (r) => r.status === "Pending",
  ).length;
  const reviewReports = allReports.filter(
    (r) => r.status === "Under Review",
  ).length;

  // Get status color and icon
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Approved":
        return {
          color: "bg-success/10 text-success",
          icon: <CheckCircle className="w-4 h-4" />,
          badge: "Approved",
        };
      case "Pending":
        return {
          color: "bg-amber-100/50 text-amber-700",
          icon: <AlertCircle className="w-4 h-4" />,
          badge: "Pending",
        };
      case "Under Review":
        return {
          color: "bg-accent/10 text-accent",
          icon: <FileText className="w-4 h-4" />,
          badge: "Under Review",
        };
      default:
        return {
          color: "bg-muted/10 text-muted-foreground",
          icon: null,
          badge: status,
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Header Section */}
      <div className="border-b border-border bg-white mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Patient Reports
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage all patient medical reports and case documentation
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Total Reports
                </p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {totalReports}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              All patient records
            </p>
          </div>

          <div className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Approved
                </p>
                <p className="text-3xl font-bold text-success mt-2">
                  {approvedReports}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Verified cases</p>
          </div>

          <div className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Under Review
                </p>
                <p className="text-3xl font-bold text-accent mt-2">
                  {reviewReports}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Filter className="w-6 h-6 text-accent" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              In verification process
            </p>
          </div>

          <div className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  Pending
                </p>
                <p className="text-3xl font-bold text-amber-700 mt-2">
                  {pendingReports}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-100/50 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-700" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Awaiting submission
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          {(["all", "approved", "review", "pending"] as const).map((filter) => (
            <Button
              key={filter}
              variant={selectedStatus === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus(filter)}
              className="capitalize"
            >
              {filter === "all" ?
                "All Reports"
              : filter === "review" ?
                "Under Review"
              : filter}
            </Button>
          ))}
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-sm">
                    Report ID
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-sm">
                    Patient Name
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-sm">
                    Hospital
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-sm">
                    Case Type
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-sm">
                    Report Date
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-sm">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-muted-foreground text-sm">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ?
                  filteredReports.map((report) => {
                    const statusConfig = getStatusConfig(report.status);
                    return (
                      <tr
                        key={report.id}
                        className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-mono text-foreground font-semibold">
                          {report.reportId}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground font-medium">
                          {report.patientName}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {report.hospital}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {report.caseType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(report.reportDate).toLocaleDateString(
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
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                          >
                            {statusConfig.icon}
                            {statusConfig.badge}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewingReport(report.id)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                : <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No reports found for the selected filter.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* View Report Modal (Simple overlay) */}
        {viewingReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 border-b border-border bg-white p-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Report Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingReport(null)}
                >
                  ✕
                </Button>
              </div>
              <div className="p-6 space-y-4">
                {(() => {
                  const report = allReports.find((r) => r.id === viewingReport);
                  return report ?
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                              Report ID
                            </p>
                            <p className="text-lg font-semibold text-foreground mt-1">
                              {report.reportId}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                              Patient Name
                            </p>
                            <p className="text-lg font-semibold text-foreground mt-1">
                              {report.patientName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                              Hospital
                            </p>
                            <p className="text-lg font-semibold text-foreground mt-1">
                              {report.hospital}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                              Case Type
                            </p>
                            <p className="text-lg font-semibold text-foreground mt-1">
                              {report.caseType}
                            </p>
                          </div>
                        </div>
                        <div className="border-t border-border pt-4">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">
                            Report Content
                          </p>
                          <div className="bg-muted/50 rounded p-4 text-sm text-muted-foreground leading-relaxed">
                            <p>
                              Patient Report Summary: This is a placeholder for
                              the detailed medical report content. In a
                              production environment, this would contain the
                              full medical assessment, diagnosis, treatment
                              recommendations, and supporting documentation.
                            </p>
                            <p className="mt-3">
                              Status:{" "}
                              <span className="font-semibold text-foreground">
                                {report.status}
                              </span>
                            </p>
                            <p className="mt-2">
                              Generated Date:{" "}
                              <span className="font-semibold text-foreground">
                                {new Date(report.reportDate).toLocaleDateString(
                                  "en-IN",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-border">
                          <Button variant="outline" className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                          <Button className="flex-1 bg-primary text-primary-foreground">
                            Print Report
                          </Button>
                        </div>
                      </>
                    : null;
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientReportsPage;
