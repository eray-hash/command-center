import type { Project } from '../types/project'
import { supabase } from './supabaseClient'
import { answerVoiceQuery } from './voiceQuery'

// Ruft die Supabase Edge Function "voice-assistant" auf (echtes KI-Gespräch via Anthropic
// API, kostenpflichtig). Fällt auf die kostenlose lokale Stichwort-/Unschärfe-Logik zurück,
// falls die Funktion (noch) nicht erreichbar ist oder der API-Key noch nicht gesetzt wurde.
export async function askVoiceAssistant(query: string, projects: Project[]): Promise<string> {
  if (!supabase) return answerVoiceQuery(query, projects).text

  try {
    const { data, error } = await supabase.functions.invoke('voice-assistant', {
      body: { query, projects },
    })
    if (error) throw error
    if (data?.error) throw new Error(data.error)
    if (typeof data?.text === 'string') return data.text
    throw new Error('Unerwartete Antwort vom Voice-Assistant')
  } catch (e) {
    console.error('KI-Assistent nicht erreichbar, nutze lokale Antwort:', e)
    return answerVoiceQuery(query, projects).text
  }
}
