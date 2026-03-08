import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Contact = Database["public"]["Tables"]["contacts"]["Row"];
export type ContactInsert = Database["public"]["Tables"]["contacts"]["Insert"];
export type ContactUpdate = Database["public"]["Tables"]["contacts"]["Update"];
export type Interaction = Database["public"]["Tables"]["contact_interactions"]["Row"];
export type InteractionInsert = Database["public"]["Tables"]["contact_interactions"]["Insert"];

export type ContactStatus = "lead" | "prospect" | "customer" | "churned" | "inactive";
export type ContactSource = "web" | "social" | "import" | "referral" | "manual";
export type InteractionType = "email" | "call" | "note" | "meeting" | "ai_insight";

export const STATUS_OPTIONS: { value: ContactStatus; label: string }[] = [
  { value: "lead", label: "Lead" },
  { value: "prospect", label: "Prospect" },
  { value: "customer", label: "Customer" },
  { value: "churned", label: "Churned" },
  { value: "inactive", label: "Inactive" },
];

export const SOURCE_OPTIONS: { value: ContactSource; label: string }[] = [
  { value: "web", label: "Web" },
  { value: "social", label: "Social" },
  { value: "import", label: "Import" },
  { value: "referral", label: "Referral" },
  { value: "manual", label: "Manual" },
];

export async function fetchContacts(userId: string) {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertContact(contact: ContactInsert) {
  const { data, error } = await supabase.from("contacts").insert(contact).select().single();
  if (error) throw error;
  return data;
}

export async function updateContact(id: string, updates: ContactUpdate) {
  const { data, error } = await supabase.from("contacts").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteContacts(ids: string[]) {
  const { error } = await supabase.from("contacts").delete().in("id", ids);
  if (error) throw error;
}

export async function fetchInteractions(contactId: string) {
  const { data, error } = await supabase
    .from("contact_interactions")
    .select("*")
    .eq("contact_id", contactId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertInteraction(interaction: InteractionInsert) {
  const { data, error } = await supabase.from("contact_interactions").insert(interaction).select().single();
  if (error) throw error;
  return data;
}

export function exportContactsCSV(contacts: Contact[]) {
  const headers = ["Name", "Email", "Company", "Position", "AI Score", "Status", "Source", "Phone", "Last Contact"];
  const rows = contacts.map((c) => [
    c.name, c.email || "", c.company || "", c.position || "",
    c.ai_score.toString(), c.status, c.source || "", c.phone || "",
    c.last_contact_at ? new Date(c.last_contact_at).toLocaleDateString("ro-RO") : "",
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `contacts_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function getScoreColor(score: number): string {
  if (score >= 70) return "text-trend-up";
  if (score >= 40) return "text-amber-400";
  return "text-trend-down";
}

export function getScoreBg(score: number): string {
  if (score >= 70) return "bg-emerald-500/10";
  if (score >= 40) return "bg-amber-400/10";
  return "bg-red-500/10";
}

const AI_INSIGHTS = [
  "Interesat de prețuri — a vizitat pagina de pricing de 3 ori",
  "Engagement crescut — a deschis ultimele 5 emailuri",
  "Potențial churn — nicio interacțiune de 14 zile",
  "Upsell opportunity — folosește planul Starter activ",
  "Decision maker — rol de management confirmat",
  "Răspunde rapid — timp mediu de răspuns sub 2h",
];

export function getAIInsights(contactId: string): string[] {
  // Mock: deterministic based on contact ID
  const hash = contactId.charCodeAt(0) + contactId.charCodeAt(contactId.length - 1);
  return [AI_INSIGHTS[hash % AI_INSIGHTS.length], AI_INSIGHTS[(hash + 2) % AI_INSIGHTS.length]];
}
