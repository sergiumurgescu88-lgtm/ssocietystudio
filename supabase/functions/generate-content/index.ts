import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, tone, subject, referenceUrl, variations = 1 } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const platformGuides: Record<string, string> = {
      linkedin: "Format profesional LinkedIn. Max 1300 caractere. Include bullet points și CTA. Adaugă 3-5 hashtag-uri relevante.",
      instagram: "Format Instagram caption. Max 2200 caractere. Ton casual dar impactant. Include emoji-uri și 15-20 hashtag-uri populare.",
      blog: "Articol blog complet. 800-1500 cuvinte. Include titlu H1, subtitluri H2, introducere, paragrafuri, și concluzie cu CTA.",
      twitter: "Thread Twitter. Max 280 caractere per tweet. 3-5 tweet-uri. Ton concis și punchy. Include 2-3 hashtag-uri.",
      facebook: "Post Facebook engaging. 200-500 caractere. Ton conversațional. Include întrebare pentru engagement.",
    };

    const systemPrompt = `Ești un expert content creator. Generează conținut de calitate pentru social media și blog.
Răspunde ÎNTOTDEAUNA în limba română.
Returnează răspunsul în format JSON cu structura:
{
  "variations": [
    {
      "content": "textul generat complet",
      "hashtags": ["hashtag1", "hashtag2"],
      "bestTimeToPost": "Marți, 10:00 AM",
      "estimatedReach": "~2.5k"
    }
  ]
}

Ghid pentru platformă: ${platformGuides[platform] || platformGuides.linkedin}
Ton: ${tone}
${referenceUrl ? `URL referință pentru inspirație: ${referenceUrl}` : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generează ${variations} ${variations > 1 ? "variații" : "variație"} de conținut despre: ${subject}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit atins. Încearcă din nou în câteva secunde." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credite insuficiente. Adaugă fonduri în Settings → Workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON from response
    let parsed;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { variations: [{ content: aiContent, hashtags: [], bestTimeToPost: "N/A", estimatedReach: "N/A" }] };
    } catch {
      parsed = { variations: [{ content: aiContent, hashtags: [], bestTimeToPost: "N/A", estimatedReach: "N/A" }] };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Content generation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
