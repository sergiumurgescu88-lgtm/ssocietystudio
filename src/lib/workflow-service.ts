import { supabase } from "@/integrations/supabase/client";

export interface WorkflowStep {
  id: string;
  type: "trigger" | "action" | "condition" | "delay";
  key: string;
  label: string;
  config: Record<string, any>;
}

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  steps: WorkflowStep[];
  is_active: boolean;
  is_template: boolean;
  last_run_at: string | null;
  last_run_status: string | null;
  run_count: number;
  fail_count: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowLog {
  id: string;
  workflow_id: string;
  user_id: string;
  status: string;
  message: string | null;
  step_index: number | null;
  created_at: string;
}

export const TRIGGERS = [
  { key: "new_lead", label: "New Lead", icon: "👤", description: "Se declanșează când apare un lead nou în CRM" },
  { key: "new_sale", label: "New Sale", icon: "💰", description: "Se declanșează la o vânzare nouă" },
  { key: "low_stock", label: "Low Stock", icon: "📦", description: "Se declanșează când stocul scade sub limită" },
  { key: "schedule", label: "Time Schedule", icon: "⏰", description: "Se execută la intervale programate" },
];

export const ACTIONS = [
  { key: "send_email", label: "Send Email", icon: "📧", description: "Trimite un email automat" },
  { key: "post_social", label: "Post Social", icon: "📱", description: "Publică pe social media" },
  { key: "update_crm", label: "Update CRM", icon: "📊", description: "Actualizează datele din CRM" },
  { key: "notify_user", label: "Notify User", icon: "🔔", description: "Trimite o notificare internă" },
];

export const CONDITIONS = [
  { key: "value_gt", label: "If Value > X", icon: "📈", description: "Verifică dacă o valoare depășește pragul" },
  { key: "status_eq", label: "If Status = Y", icon: "🏷️", description: "Verifică statusul unui element" },
  { key: "score_gt", label: "If AI Score > Z", icon: "🤖", description: "Verifică scorul AI al contactului" },
];

export const DELAYS = [
  { key: "delay_1h", label: "Wait 1 Hour", icon: "⏳", description: "Pauză de 1 oră" },
  { key: "delay_1d", label: "Wait 1 Day", icon: "📅", description: "Pauză de 1 zi" },
  { key: "delay_2d", label: "Wait 2 Days", icon: "📅", description: "Pauză de 2 zile" },
  { key: "delay_7d", label: "Wait 1 Week", icon: "🗓️", description: "Pauză de 1 săptămână" },
];

export const WORKFLOW_TEMPLATES = [
  {
    name: "Lead Nurturing",
    description: "Cultivă lead-urile noi cu email-uri automate",
    steps: [
      { id: "1", type: "trigger" as const, key: "new_lead", label: "New Lead", config: {} },
      { id: "2", type: "delay" as const, key: "delay_1d", label: "Wait 1 Day", config: {} },
      { id: "3", type: "action" as const, key: "send_email", label: "Send Email", config: { template: "welcome" } },
      { id: "4", type: "delay" as const, key: "delay_2d", label: "Wait 2 Days", config: {} },
      { id: "5", type: "condition" as const, key: "score_gt", label: "If AI Score > Z", config: { value: 60 } },
      { id: "6", type: "action" as const, key: "notify_user", label: "Notify User", config: {} },
    ],
  },
  {
    name: "Sales Alert",
    description: "Notifică echipa la vânzări mari",
    steps: [
      { id: "1", type: "trigger" as const, key: "new_sale", label: "New Sale", config: {} },
      { id: "2", type: "condition" as const, key: "value_gt", label: "If Value > X", config: { value: 1000 } },
      { id: "3", type: "action" as const, key: "notify_user", label: "Notify User", config: {} },
    ],
  },
  {
    name: "Social Auto-Post",
    description: "Publică automat pe social media programat",
    steps: [
      { id: "1", type: "trigger" as const, key: "schedule", label: "Time Schedule", config: { cron: "daily" } },
      { id: "2", type: "action" as const, key: "post_social", label: "Post Social", config: {} },
      { id: "3", type: "action" as const, key: "update_crm", label: "Update CRM", config: { field: "last_post" } },
    ],
  },
];

export async function fetchWorkflows(userId: string) {
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((w: any) => ({
    ...w,
    steps: (typeof w.steps === "string" ? JSON.parse(w.steps) : w.steps) as WorkflowStep[],
  })) as Workflow[];
}

export async function saveWorkflow(workflow: {
  user_id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
}) {
  const { data, error } = await supabase
    .from("workflows")
    .insert({
      user_id: workflow.user_id,
      name: workflow.name,
      description: workflow.description || null,
      steps: workflow.steps as any,
    })
    .select()
    .single();
  if (error) throw error;
  return { ...data, steps: data.steps as unknown as WorkflowStep[] } as Workflow;
}

export async function updateWorkflow(id: string, updates: Partial<{
  name: string;
  description: string;
  steps: WorkflowStep[];
  is_active: boolean;
}>) {
  const payload: any = { ...updates, updated_at: new Date().toISOString() };
  if (updates.steps) payload.steps = updates.steps as any;
  const { data, error } = await supabase
    .from("workflows")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return { ...data, steps: data.steps as unknown as WorkflowStep[] } as Workflow;
}

export async function deleteWorkflow(id: string) {
  const { error } = await supabase.from("workflows").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchWorkflowLogs(workflowId: string) {
  const { data, error } = await supabase
    .from("workflow_logs")
    .select("*")
    .eq("workflow_id", workflowId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data as WorkflowLog[];
}

export async function addWorkflowLog(log: {
  workflow_id: string;
  user_id: string;
  status: string;
  message: string;
  step_index?: number;
}) {
  const { error } = await supabase.from("workflow_logs").insert(log);
  if (error) throw error;
}

export async function testWorkflow(workflow: Workflow, userId: string): Promise<WorkflowLog[]> {
  const logs: WorkflowLog[] = [];
  for (let i = 0; i < workflow.steps.length; i++) {
    const step = workflow.steps[i];
    const isSuccess = Math.random() > 0.15;
    const log = {
      workflow_id: workflow.id,
      user_id: userId,
      status: isSuccess ? "success" : "fail",
      message: isSuccess
        ? `✅ ${step.label} executat cu succes`
        : `❌ ${step.label} a eșuat: timeout`,
      step_index: i,
    };
    await addWorkflowLog(log);
    logs.push({ ...log, id: crypto.randomUUID(), created_at: new Date().toISOString() });
    if (!isSuccess) break;
  }

  const allSuccess = logs.every((l) => l.status === "success");
  await supabase
    .from("workflows")
    .update({
      last_run_at: new Date().toISOString(),
      last_run_status: allSuccess ? "success" : "fail",
      run_count: workflow.run_count + 1,
      fail_count: allSuccess ? workflow.fail_count : workflow.fail_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", workflow.id);

  return logs;
}

export function getStepMeta(type: string, key: string) {
  const allOptions = [...TRIGGERS, ...ACTIONS, ...CONDITIONS, ...DELAYS];
  return allOptions.find((o) => o.key === key) || { key, label: key, icon: "⚙️", description: "" };
}
