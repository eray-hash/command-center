import { useEffect, useState } from 'react'
import type { Workspace } from '../types/workspace'
import { defaultWorkspaces } from '../data/mockWorkspaces'
import { isSupabaseConfigured, supabase } from './supabaseClient'

const STORAGE_KEY = 'command-center:workspaces'
const SELECTED_KEY = 'command-center:selected-workspace'

interface WorkspaceRow {
  id: string
  name: string
  kind: Workspace['kind']
  owner_id: string | null
}

function mapWorkspace(row: WorkspaceRow): Workspace {
  return { id: row.id, name: row.name, kind: row.kind, ownerId: row.owner_id }
}

function loadWorkspacesLocal(): Workspace[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Workspace[]) : defaultWorkspaces
  } catch {
    return defaultWorkspaces
  }
}

function loadSelectedLocal(fallback: string): string {
  try {
    return localStorage.getItem(SELECTED_KEY) ?? fallback
  } catch {
    return fallback
  }
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() =>
    isSupabaseConfigured ? [] : loadWorkspacesLocal(),
  )
  const [selectedId, setSelectedIdState] = useState<string>(() => loadSelectedLocal('gemeinsam'))

  function setSelectedId(id: string) {
    setSelectedIdState(id)
    try {
      localStorage.setItem(SELECTED_KEY, id)
    } catch {
      // ignorieren — reiner Komfort
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces))
      } catch {
        // ignorieren
      }
    }
  }, [workspaces])

  useEffect(() => {
    if (!supabase) return

    async function loadWorkspaces() {
      const {
        data: { user },
      } = await supabase!.auth.getUser()

      const { data, error } = await supabase!.from('workspaces').select('*')
      if (error) {
        console.error('Bereiche konnten nicht geladen werden:', error.message)
        return
      }

      let rows = (data ?? []) as WorkspaceRow[]

      // Eigener privater Bereich fehlt noch (erster Login dieses Nutzers) → automatisch anlegen.
      const hasOwnPrivate = rows.some((r) => r.kind === 'privat' && r.owner_id === user?.id)
      if (user && !hasOwnPrivate) {
        const label = user.email ? `${user.email.split('@')[0]} – privat` : 'Privat'
        const { data: created, error: createError } = await supabase!
          .from('workspaces')
          .insert({ name: label, kind: 'privat', owner_id: user.id })
          .select()
          .single()
        if (!createError && created) rows = [...rows, created as WorkspaceRow]
      }

      const mapped = rows.map(mapWorkspace)
      setWorkspaces(mapped)

      const shared = mapped.find((w) => w.kind === 'gemeinsam')
      const stillValid = mapped.some((w) => w.id === selectedId)
      if (!stillValid && shared) setSelectedId(shared.id)
    }

    loadWorkspaces()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addWorkspace(name: string) {
    if (supabase) {
      supabase
        .from('workspaces')
        .insert({ name, kind: 'custom', owner_id: null })
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Bereich konnte nicht angelegt werden:', error.message)
            return
          }
          const workspace = mapWorkspace(data as WorkspaceRow)
          setWorkspaces((prev) => [...prev, workspace])
          setSelectedId(workspace.id)
        })
      return
    }

    const workspace: Workspace = { id: crypto.randomUUID(), name, kind: 'custom', ownerId: null }
    setWorkspaces((prev) => [...prev, workspace])
    setSelectedId(workspace.id)
  }

  return { workspaces, selectedId, setSelectedId, addWorkspace }
}
