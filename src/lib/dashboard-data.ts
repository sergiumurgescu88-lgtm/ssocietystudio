export type Period = "today" | "week" | "month";

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toLocaleString("ro-RO");
}

// Mock data generators keyed by period
const revenueByPeriod: Record<Period, { name: string; revenue: number; leads: number }[]> = {
  today: [
    { name: "08:00", revenue: 120, leads: 3 },
    { name: "10:00", revenue: 340, leads: 5 },
    { name: "12:00", revenue: 560, leads: 8 },
    { name: "14:00", revenue: 420, leads: 6 },
    { name: "16:00", revenue: 780, leads: 12 },
    { name: "18:00", revenue: 650, leads: 9 },
  ],
  week: [
    { name: "Lun", revenue: 2400, leads: 24 },
    { name: "Mar", revenue: 1398, leads: 18 },
    { name: "Mie", revenue: 3200, leads: 32 },
    { name: "Joi", revenue: 2780, leads: 28 },
    { name: "Vin", revenue: 4100, leads: 41 },
    { name: "Sâm", revenue: 1900, leads: 15 },
    { name: "Dum", revenue: 980, leads: 8 },
  ],
  month: [
    { name: "S1", revenue: 12400, leads: 124 },
    { name: "S2", revenue: 15800, leads: 158 },
    { name: "S3", revenue: 18200, leads: 182 },
    { name: "S4", revenue: 21500, leads: 215 },
  ],
};

const statsByPeriod: Record<Period, { revenue: number; revenueTrend: string; leads: number; leadsTrend: string; agents: number; tasks: number; tasksTrend: string }> = {
  today: { revenue: 2870, revenueTrend: "+14.2%", leads: 43, leadsTrend: "+8", agents: 12, tasks: 67, tasksTrend: "+23" },
  week: { revenue: 16758, revenueTrend: "+9.5%", leads: 166, leadsTrend: "+34", agents: 15, tasks: 342, tasksTrend: "+78" },
  month: { revenue: 67900, revenueTrend: "+18.3%", leads: 679, leadsTrend: "+142", agents: 18, tasks: 1420, tasksTrend: "+310" },
};

export function getRevenueData(period: Period) {
  return revenueByPeriod[period];
}

export function getStats(period: Period) {
  return statsByPeriod[period];
}

export interface Agent {
  name: string;
  role: string;
  status: "online" | "working" | "offline";
}

export const agents: Agent[] = [
  { name: "Agent Alpha", role: "Lead Scoring", status: "online" },
  { name: "Agent Beta", role: "Email Outreach", status: "working" },
  { name: "Agent Gamma", role: "Content Writer", status: "online" },
  { name: "Agent Delta", role: "Social Media", status: "offline" },
  { name: "Agent Epsilon", role: "Data Analyst", status: "working" },
  { name: "Agent Zeta", role: "CRM Sync", status: "online" },
];

export interface FeedItem {
  id: string;
  avatar: string;
  text: string;
  timestamp: string;
  status: "success" | "warning" | "error" | "info";
  category: "sales" | "marketing" | "system";
}

export const feedItems: FeedItem[] = [
  { id: "1", avatar: "AA", text: "Agent Alpha a scorat 45 lead-uri noi", timestamp: "acum 2 min", status: "success", category: "sales" },
  { id: "2", avatar: "AB", text: "Agent Beta a trimis campania email #12", timestamp: "acum 8 min", status: "info", category: "marketing" },
  { id: "3", avatar: "SY", text: "CRM sync eșuat pentru Salesforce", timestamp: "acum 15 min", status: "error", category: "system" },
  { id: "4", avatar: "AG", text: "Agent Gamma a generat 3 articole blog", timestamp: "acum 22 min", status: "success", category: "marketing" },
  { id: "5", avatar: "AE", text: "Raport săptămânal generat automat", timestamp: "acum 35 min", status: "info", category: "system" },
  { id: "6", avatar: "AD", text: "Lead nou: TechCorp SRL — $12.5k deal", timestamp: "acum 42 min", status: "success", category: "sales" },
  { id: "7", avatar: "AZ", text: "Agent Zeta a sincronizat 128 contacte", timestamp: "acum 1h", status: "info", category: "system" },
  { id: "8", avatar: "AB", text: "Campanie Meta Ads optimizată: CTR +2.3%", timestamp: "acum 1.5h", status: "success", category: "marketing" },
];

export const topContent = [
  { title: "Ghid complet AI Marketing 2024", views: 12400, engagement: "8.2%" },
  { title: "Studiu de caz: Automatizare vânzări", views: 8900, engagement: "6.7%" },
  { title: "Top 10 strategii lead generation", views: 6200, engagement: "5.4%" },
];

export interface UrgentTask {
  id: string;
  title: string;
  priority: "high" | "critical";
  dueIn: string;
}

export const urgentTasks: UrgentTask[] = [
  { id: "1", title: "Aprobă campania Q1 outreach", priority: "critical", dueIn: "30 min" },
  { id: "2", title: "Review buget Meta Ads", priority: "high", dueIn: "2h" },
  { id: "3", title: "Validează lead scoring model v3", priority: "high", dueIn: "4h" },
];
