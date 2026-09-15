import { useEffect, useState } from 'react'
import type { RecordingMeta } from '../types/recording'
import { saveBlob, deleteBlob } from './recordingsDb'

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

// Aufnahmen liegen aktuell nur lokal in diesem Browser (IndexedDB), noch nicht in der
// Cloud gesichert. Bevor Audiodaten von Kundengesprächen dauerhaft in Supabase Storage
// landen, sollte die Aufbewahrungsdauer/Zugriffsregel bewusst festgelegt werden.
export function useRecordings() {
  const [items, setItems] = useState<RecordingMeta[]>(load)

  useEffect(() => {
    save(items)
  }, [items])

  async function addRecording(blob: Blob, durationSec: number) {
    const id = crypto.randomUUID()
    await saveBlob(id, blob)
    const meta: RecordingMeta = {
      id,
      createdAt: new Date().toISOString(),
      durationSec,
      projectId: null,
      assigned: false,
    }
    setItems((prev) => [meta, ...prev])
  }

  function assignRecording(id: string, projectId: string | null) {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, projectId, assigned: true } : r)))
  }

  async function removeRecording(id: string) {
    await deleteBlob(id)
    setItems((prev) => prev.filter((r) => r.id !== id))
  }

  const pendingAssignment = items.filter((r) => !r.assigned)

  return { items, pendingAssignment, addRecording, assignRecording, removeRecording }
}
