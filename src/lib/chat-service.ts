import { supabase } from "@/integrations/supabase/client";

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  feedback: string | null;
  created_at: string;
}

export async function fetchConversations(userId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as Conversation[];
}

export async function createConversation(userId: string, title?: string) {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId, title: title || "Conversație nouă" })
    .select()
    .single();
  if (error) throw error;
  return data as Conversation;
}

export async function deleteConversation(id: string) {
  const { error } = await supabase.from("conversations").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchMessages(conversationId: string) {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as ChatMessage[];
}

export async function saveMessage(
  conversationId: string,
  userId: string,
  role: "user" | "assistant",
  content: string
) {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ conversation_id: conversationId, user_id: userId, role, content })
    .select()
    .single();
  if (error) throw error;
  // Update conversation timestamp
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);
  return data as ChatMessage;
}

export async function updateMessageFeedback(messageId: string, feedback: string) {
  const { error } = await supabase
    .from("chat_messages")
    .update({ feedback })
    .eq("id", messageId);
  if (error) throw error;
}

export async function streamAIResponse(
  messages: { role: string; content: string }[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
) {
  try {
    const response = await supabase.functions.invoke("command-chat", {
      body: { messages },
    });

    if (response.error) throw new Error(response.error.message);

    const reader = (response.data as ReadableStream).getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") {
          onDone();
          return;
        }
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onChunk(content);
        } catch {
          // skip malformed chunks
        }
      }
    }
    onDone();
  } catch (err: any) {
    onError(err.message || "Eroare la comunicarea cu AI");
  }
}

export const QUICK_COMMANDS = [
  { label: "📊 Raport Vânzări", prompt: "Generează un raport de vânzări pentru ultima săptămână." },
  { label: "✍️ Generează Post", prompt: "Generează un post pentru social media despre produsul nostru." },
  { label: "🔍 Găsește Lead-uri", prompt: "Analizează lead-urile recente și sugerează care au cel mai mare potențial." },
  { label: "📧 Draft Email", prompt: "Scrie un email de follow-up profesional pentru un client potențial." },
  { label: "📈 Strategie Marketing", prompt: "Propune o strategie de marketing pentru luna următoare." },
];
