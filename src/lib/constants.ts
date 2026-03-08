import {
  LayoutDashboard,
  Brain,
  Bot,
  MessageSquare,
  FileText,
  GitBranch,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "CRM Neural", url: "/crm", icon: Brain },
  { title: "Agent Army", url: "/agents", icon: Bot },
  { title: "Command Chat", url: "/chat", icon: MessageSquare },
  { title: "Content", url: "/content", icon: FileText },
  { title: "Workflows", url: "/workflows", icon: GitBranch },
  { title: "Settings", url: "/settings", icon: Settings },
];

export const APP_NAME = "SSociety Studio";
export const APP_YEAR = 2024;
