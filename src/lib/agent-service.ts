import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Agent = Database["public"]["Tables"]["agents"]["Row"];
export type AgentInsert = Database["public"]["Tables"]["agents"]["Insert"];
export type AgentUpdate = Database["public"]["Tables"]["agents"]["Update"];
export type AgentLog = Database["public"]["Tables"]["agent_logs"]["Row"];

export type AgentStatus = "idle" | "working" | "error";
export type AutonomyLevel = 0 | 1 | 2;

export const AUTONOMY_LABELS: Record<number, string> = {
  0: "Manual",
  1: "Supervised",
  2: "Autonomous",
};

export const AUTONOMY_DESCRIPTIONS: Record<number, string> = {
  0: "Toate acțiunile necesită aprobare umană",
  1: "Agentul acționează dar raportează deciziile",
  2: "Agentul acționează independent în limita bugetului",
};

export interface DefaultAgent {
  slug: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  system_prompt: string;
  budget_limit: number;
  autonomy: number;
  sort_order: number;
}

export const DEFAULT_AGENTS: DefaultAgent[] = [
  {
    slug: "ceo",
    name: "Agent CEO",
    role: "Chief Executive Officer",
    description: "Coordonează strategia generală, alocă resursele și monitorizează performanța tuturor agenților.",
    icon: "crown",
    system_prompt: "You are the CEO agent. Coordinate overall strategy, allocate resources, and monitor performance of all other agents.",
    budget_limit: 500,
    autonomy: 1,
    sort_order: 0,
  },
  {
    slug: "cmo",
    name: "Agent CMO",
    role: "Chief Marketing Officer",
    description: "Gestionează campanii marketing, content strategy și brand awareness prin canale digitale.",
    icon: "megaphone",
    system_prompt: "You are the CMO agent. Manage marketing campaigns, content strategy, and brand awareness across digital channels.",
    budget_limit: 200,
    autonomy: 1,
    sort_order: 1,
  },
  {
    slug: "cro",
    name: "Agent CRO",
    role: "Chief Revenue Officer",
    description: "Optimizează pipeline-ul de vânzări, lead scoring și conversion rate optimization.",
    icon: "trending-up",
    system_prompt: "You are the CRO agent. Optimize the sales pipeline, lead scoring, and conversion rate across all channels.",
    budget_limit: 300,
    autonomy: 1,
    sort_order: 2,
  },
  {
    slug: "cto",
    name: "Agent CTO",
    role: "Chief Technology Officer",
    description: "Administrează infrastructura tehnică, integrări API și automatizări de workflow.",
    icon: "cpu",
    system_prompt: "You are the CTO agent. Manage technical infrastructure, API integrations, and workflow automations.",
    budget_limit: 150,
    autonomy: 2,
    sort_order: 3,
  },
  {
    slug: "cso",
    name: "Agent CSO",
    role: "Chief Strategy Officer",
    description: "Analizează piața, competiția și identifică oportunități strategice de creștere.",
    icon: "compass",
    system_prompt: "You are the CSO agent. Analyze market trends, competition, and identify strategic growth opportunities.",
    budget_limit: 100,
    autonomy: 0,
    sort_order: 4,
  },
  {
    slug: "cfo",
    name: "Agent CFO",
    role: "Chief Financial Officer",
    description: "Monitorizează bugetele, ROI-ul campaniilor și optimizează alocarea financiară.",
    icon: "wallet",
    system_prompt: "You are the CFO agent. Monitor budgets, campaign ROI, and optimize financial allocation across operations.",
    budget_limit: 50,
    autonomy: 0,
    sort_order: 5,
  },
];

export async function fetchAgents(userId: string): Promise<Agent[]> {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

export async function seedDefaultAgents(userId: string): Promise<Agent[]> {
  const inserts: AgentInsert[] = DEFAULT_AGENTS.map((a) => ({
    user_id: userId,
    slug: a.slug,
    name: a.name,
    role: a.role,
    description: a.description,
    icon: a.icon,
    system_prompt: a.system_prompt,
    budget_limit: a.budget_limit,
    autonomy: a.autonomy,
    sort_order: a.sort_order,
  }));
  const { data, error } = await supabase.from("agents").insert(inserts).select();
  if (error) throw error;
  return data;
}

export async function updateAgent(id: string, updates: AgentUpdate): Promise<Agent> {
  const { data, error } = await supabase.from("agents").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function fetchAgentLogs(agentId: string, limit = 20): Promise<AgentLog[]> {
  const { data, error } = await supabase
    .from("agent_logs")
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function insertAgentLog(log: { agent_id: string; user_id: string; type: string; title: string; content?: string }): Promise<AgentLog> {
  const { data, error } = await supabase.from("agent_logs").insert(log).select().single();
  if (error) throw error;
  return data;
}

export function resetAgentConfig(agent: Agent): AgentUpdate {
  const def = DEFAULT_AGENTS.find((d) => d.slug === agent.slug);
  if (!def) return {};
  return {
    system_prompt: def.system_prompt,
    budget_limit: def.budget_limit,
    autonomy: def.autonomy,
    is_active: true,
    status: "idle",
  };
}

// Mock performance data
export function getAgentPerformance(agentSlug: string): { day: string; tasks: number }[] {
  const base = agentSlug.charCodeAt(1) * 3;
  return ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"].map((day, i) => ({
    day,
    tasks: Math.max(2, Math.round((base + i * 7) % 30 + Math.sin(i) * 8)),
  }));
}
