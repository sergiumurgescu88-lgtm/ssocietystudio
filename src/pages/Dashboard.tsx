import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DollarSign, Users, Bot, CheckCircle } from "lucide-react";
import { type Period, getStats } from "@/lib/dashboard-data";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { AgentStatusGrid } from "@/components/dashboard/AgentStatusGrid";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { TopContent } from "@/components/dashboard/TopContent";
import { UrgentTasks } from "@/components/dashboard/UrgentTasks";
import { HealthScore } from "@/components/dashboard/HealthScore";
import { QuickActions } from "@/components/dashboard/QuickActions";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bună dimineața";
  if (h < 18) return "Bună ziua";
  return "Bună seara";
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [period, setPeriod] = useState<Period>("week");
  const [refreshKey, setRefreshKey] = useState(0);
  const stats = getStats(period);

  // Auto-refresh every 30s
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  useEffect(() => {
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const healthScore = Math.min(100, Math.round((stats.leads / 10) + (stats.tasks / 20) + 40));

  return (
    <div key={refreshKey}>
      {/* Greeting */}
      <div className="mb-6 opacity-0 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {getGreeting()}, {firstName}! 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Iată ce se întâmplă în SSociety Studio astăzi.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard title="Revenue" value={stats.revenue} trend="up" trendValue={stats.revenueTrend} icon={DollarSign} tooltip="Venituri totale în perioada selectată" delay={50} />
        <DashboardStatCard title="Lead-uri" value={stats.leads} trend="up" trendValue={stats.leadsTrend} icon={Users} tooltip="Lead-uri noi generate de agenți" delay={100} />
        <DashboardStatCard title="Agenți Activi" value={stats.agents} trend="up" trendValue="+3" icon={Bot} tooltip="Agenți AI activi în acest moment" delay={150} />
        <DashboardStatCard title="Tasks Done" value={stats.tasks} trend="up" trendValue={stats.tasksTrend} icon={CheckCircle} tooltip="Sarcini finalizate automat" delay={200} />
      </div>

      {/* Main content grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left column: chart + agents */}
        <div className="space-y-6 lg:col-span-2">
          <RevenueChart period={period} onPeriodChange={setPeriod} />
          <AgentStatusGrid />
        </div>

        {/* Right column: health + top content */}
        <div className="space-y-6">
          <HealthScore score={healthScore} />
          <TopContent />
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ActivityFeed />
        <UrgentTasks />
      </div>

      {/* Floating quick actions */}
      <QuickActions />
    </div>
  );
}
