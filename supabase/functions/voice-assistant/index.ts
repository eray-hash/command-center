// Voice-Assistent für das Command Center: nimmt eine frei formulierte Frage entgegen,
// reichert sie mit dem aktuellen Projekt-/Task-Stand an und lässt Claude (Anthropic API)
// eine natürliche Antwort formulieren. Der API-Key liegt nur hier als Supabase-Secret,
// nie im Frontend. verify_jwt=true stellt sicher, dass nur eingeloggte Nutzer (Eray/Hassan)
// diesen kostenpflichtigen Aufruf auslösen können.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Reduziert die Projektdaten auf das für eine Antwort Nötige, um Prompt-Größe (= Kosten)
// klein zu halten — lange Freitextfelder wie Gesprächsprotokolle werden weggelassen.
function summarizeProjects(projects: any[]): unknown {
  return projects.map((p) => ({
    name: p.name,
    kind: p.kind,
    status: p.status,
    prio: p.prio,
    currentTask: p.currentTask,
    milestones: (p.milestones ?? []).map((m: any) => ({
      title: m.title,
      eta: m.eta,
      tasks: (m.tasks ?? []).map((t: any) => ({
        title: t.title,
        status: t.status,
        prio: t.prio,
        zustaendig: t.zustaendig,
        wiedervorlage: t.wiedervorlage,
        naechsterSchritt: t.naechsterSchritt,
        fragen: t.fragen,
        fuerClaude: t.fuerClaude,
      })),
    })),
  }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, projects } = await req.json();
    if (!query || typeof query !== "string") return json({ error: "query fehlt" }, 400);

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return json(
        { error: "ANTHROPIC_API_KEY ist als Supabase-Secret noch nicht gesetzt." },
        500,
      );
    }

    const today = new Date().toISOString().slice(0, 10);
    const system =
      `Du bist der Sprachassistent im "Fundament Command Center" von Eray Yesil und Hassan Süslü. ` +
      `Heutiges Datum: ${today}. Beantworte Fragen kurz, klar und auf Deutsch, ausschließlich auf ` +
      `Basis der folgenden aktuellen Projekt-/Task-Daten (JSON). Wenn eine Information darin fehlt, ` +
      `sag ehrlich, dass du es nicht weißt, statt zu raten. Antworte in ein bis drei Sätzen, ` +
      `so dass es sich gut vorlesen lässt.\n\n${JSON.stringify(summarizeProjects(projects ?? []))}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system,
        messages: [{ role: "user", content: query }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return json({ error: `Anthropic API Fehler: ${errText}` }, 502);
    }

    const data = await res.json();
    const text = data?.content?.[0]?.text ?? "Ich konnte keine Antwort erzeugen.";
    return json({ text });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
