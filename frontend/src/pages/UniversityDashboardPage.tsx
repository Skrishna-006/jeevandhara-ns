import { TrendingUp, Users, Heart, BookOpen, Activity } from "lucide-react";
import { useState } from "react";

interface RecentActivity {
  id: string;
  type: "contribution" | "approval" | "patient-added";
  description: string;
  details: string;
  timestamp: string;
  icon: React.ReactNode;
}

const UniversityDashboardPage = () => {
  // Static dashboard data
  const totalContributions = "₹2,50,00,000";
  const patientsSupported = 245;
  const activeCampaigns = 18;
  const studentsParticipating = 1840;
  const thisMonthContributions = "₹12,50,000";
  const monthlyTrend = "+8.5%";

  // Static recent activity data
  const recentActivities: RecentActivity[] = [
    {
      id: "1",
      type: "contribution",
      description: "Students contributed for Meena Devi's cardiac surgery",
      details: "₹25,000 collected",
      timestamp: "2026-03-03 14:30",
      icon: <Heart className="w-4 h-4 text-success" />,
    },
    {
      id: "2",
      type: "approval",
      description: "Case JD-2847 approved by hospital",
      details: "Ravi Kumar - Orthopedic treatment",
      timestamp: "2026-03-02 10:15",
      icon: <TrendingUp className="w-4 h-4 text-primary" />,
    },
    {
      id: "3",
      type: "patient-added",
      description: "New patient case registered",
      details: "Patient needs urgent cardiac intervention",
      timestamp: "2026-03-01 09:45",
      icon: <Users className="w-4 h-4 text-accent" />,
    },
    {
      id: "4",
      type: "contribution",
      description: "Students contributed for Anjali Verma's treatment",
      details: "₹18,500 collected",
      timestamp: "2026-02-28 16:20",
      icon: <Heart className="w-4 h-4 text-success" />,
    },
    {
      id: "5",
      type: "approval",
      description: "Funding approved for JD-2845",
      details: "CMC Vellore - Cancer treatment fund",
      timestamp: "2026-02-27 11:32",
      icon: <TrendingUp className="w-4 h-4 text-primary" />,
    },
  ];

  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  return (
    <div className="space-y-8 w-full">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Contributions */}
        <div className="bg-white border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                Total Contributions
              </p>
              <p className="text-3xl font-bold text-foreground">
                {totalContributions}
              </p>
              <p className="text-xs text-success mt-2">
                ↑ {monthlyTrend} this month
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        {/* Patients Supported */}
        <div className="bg-white border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                Patients Supported
              </p>
              <p className="text-3xl font-bold text-foreground">
                {patientsSupported}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Successfully funded
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-success" />
            </div>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="bg-white border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                Active Campaigns
              </p>
              <p className="text-3xl font-bold text-foreground">
                {activeCampaigns}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Ongoing initiatives
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-accent" />
            </div>
          </div>
        </div>

        {/* Students Participating */}
        <div className="bg-white border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                Students Participating
              </p>
              <p className="text-3xl font-bold text-foreground">
                {studentsParticipating}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                This semester
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-secondary" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Contribution */}
      <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              This Month's Contributions
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Total raised so far
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {thisMonthContributions}
            </p>
            <p className="text-xs text-success mt-1">
              ↑ {monthlyTrend} from last month
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg h-2"></div>
        <p className="text-xs text-muted-foreground mt-3">
          Collected from 1,584 student donations across 18 active campaigns
        </p>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border bg-muted/50">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Activity
          </h2>
        </div>

        <div className="divide-y divide-border">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="px-6 py-4 hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() =>
                setSelectedActivity(
                  selectedActivity === activity.id ? null : activity.id,
                )
              }
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">{activity.icon}</div>
                <div className="flex-grow">
                  <p className="font-medium text-foreground">
                    {activity.description}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.details}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
              {selectedActivity === activity.id && (
                <div className="mt-3 p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                  <p>
                    Activity details would display here in a full
                    implementation.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-border text-center">
          <button className="text-sm text-primary hover:underline font-medium">
            View All Activity →
          </button>
        </div>
      </div>
    </div>
  );
};

export default UniversityDashboardPage;
