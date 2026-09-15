import { useEffect, useState } from 'react'
import type { RecordingMeta } from '../types/recording'

const STORAGE_KEY = 'command-center:recordings'

function load(): RecordingMeta[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as RecordingMeta[]) : []
  } catch {
    return []
  }
}

function save(items: RecordingMeta[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignorieren — reiner Komfort
  }
}

// Es wird nur die Text-Mitschrift gespeichert, keine Audiodatei — reicht als Protokoll
// und ist datensparsamer als das Original-Gespräch dauerhaft vorzuhalten.
export function useRecordings() {
  const [items, setItems] = useState<RecordingMeta[]>(load)

  useEffect(() => {
    save(items)
  }, [items])

  function addRecording(transcript: string, durationSec: number) {
    const meta: RecordingMeta = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      durationSec,
      transcript,
      projectId: null,
      assigned: false,
    }
    setItems((prev) => [meta, ...prev])
  }

  function assignRecording(id: string, projectId: string | null) {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, projectId, assigned: true } : r)))
  }

  function removeRecording(id: string) {
    setItems((prev) => prev.filter((r) => r.id !== id))
  }

  const pendingAssignment = items.filter((r) => !r.assigned)

  return { items, pendingAssignment, addRecording, assignRecording, removeRecording }
}
