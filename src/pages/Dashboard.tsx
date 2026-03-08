import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { ActivityItem } from "@/components/ActivityItem";
import { Users, Zap, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { title: "Total Users", value: "2,847", trend: "up" as const, trendValue: "+12.5%", icon: Users },
  { title: "Active Agents", value: "18", trend: "up" as const, trendValue: "+3", icon: Zap },
  { title: "Revenue", value: "$48.2K", trend: "up" as const, trendValue: "+8.1%", icon: TrendingUp },
  { title: "Tasks Running", value: "142", trend: "down" as const, trendValue: "-5", icon: Activity },
];

const activities = [
  { avatar: "JD", text: "Agent Alpha completed lead scoring batch", timestamp: "2 min ago", status: "success" as const },
  { avatar: "MK", text: "New workflow 'Email Outreach v3' deployed", timestamp: "15 min ago", status: "info" as const },
  { avatar: "AR", text: "CRM sync failed for Salesforce connector", timestamp: "1h ago", status: "error" as const },
  { avatar: "TP", text: "Content generation queue at 85% capacity", timestamp: "2h ago", status: "warning" as const },
  { avatar: "SS", text: "Monthly report generated successfully", timestamp: "3h ago", status: "success" as const },
];

export default function Dashboard() {
  return (
    <>
      <PageHeader title="Dashboard" description="Welcome back. Here's what's happening today." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 p-0 pb-2">
          {activities.map((a, i) => (
            <ActivityItem key={i} {...a} />
          ))}
        </CardContent>
      </Card>
    </>
  );
}
