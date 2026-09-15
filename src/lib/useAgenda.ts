import { useEffect, useState } from 'react'
import type { AgendaItem } from '../types/agenda'
import { isSupabaseConfigured, supabase } from './supabaseClient'

const STORAGE_KEY = 'command-center:agenda'

function loadLocal(): AgendaItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AgendaItem[]) : []
  } catch {
    return []
  }
}

function saveLocal(items: AgendaItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // localStorage kann in manchen Kontexten (privates Fenster) fehlschlagen — dann bleibt der Stand nur im Speicher.
  }
}

// Solange keine Supabase-Verbindung besteht, läuft die Agenda rein lokal (pro Gerät).
// Sobald `supabase` konfiguriert ist, laufen add/toggle/remove gegen die
// `agenda_items`-Tabelle (Realtime-Sync zwischen Eray und Hassan).
export function useAgenda() {
  const [items, setItems] = useState<AgendaItem[]>(() => (isSupabaseConfigured ? [] : loadLocal()))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) saveLocal(items)
  }, [items])

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('agenda_items')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Agenda konnte nicht geladen werden:', error.message)
          setError('Agenda konnte nicht geladen werden: ' + error.message)
          return
        }
        if (data) {
          setItems(
            data.map((row) => ({
              id: row.id,
              text: row.text,
              projectId: row.project_id,
              status: row.status,
              createdAt: row.created_at,
            })),
          )
        }
      })
  }, [])

  function add(text: string, projectId: string | null) {
    const item: AgendaItem = {
      id: crypto.randomUUID(),
      text,
      projectId,
      status: 'offen',
      createdAt: new Date().toISOString(),
    }
    setItems((prev) => [item, ...prev])
    setError(null)

    if (supabase) {
      supabase
        .from('agenda_items')
        .insert({ id: item.id, text, project_id: projectId, status: 'offen' })
        .then(({ error }) => {
          if (error) {
            console.error('Agenda-Punkt konnte nicht gespeichert werden:', error.message)
            setError('Konnte nicht gespeichert werden — bitte nochmal versuchen: ' + error.message)
            // Optimistischen Eintrag zurücknehmen, da er tatsächlich nicht gespeichert wurde.
            setItems((prev) => prev.filter((i) => i.id !== item.id))
          }
        })
    }
  }

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: item.status === 'offen' ? 'erledigt' : 'offen' } : item,
      ),
    )
    if (supabase) {
      const current = items.find((i) => i.id === id)
      if (current) {
        supabase
          .from('agenda_items')
          .update({ status: current.status === 'offen' ? 'erledigt' : 'offen' })
          .eq('id', id)
          .then(({ error }) => {
            if (error) {
              console.error('Agenda-Status konnte nicht gespeichert werden:', error.message)
              setError('Status-Änderung konnte nicht gespeichert werden: ' + error.message)
            }
          })
      }
    }
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
    if (supabase) {
      supabase
        .from('agenda_items')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Agenda-Punkt konnte nicht gelöscht werden:', error.message)
            setError('Löschen fehlgeschlagen: ' + error.message)
          }
        })
    }
  }

  return { items, error, add, toggle, remove }
}
