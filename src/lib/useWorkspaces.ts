import { useEffect, useState } from 'react'
import type { Workspace } from '../types/workspace'
import { defaultWorkspaces } from '../data/mockWorkspaces'

const STORAGE_KEY = 'command-center:workspaces'
const SELECTED_KEY = 'command-center:selected-workspace'

function loadWorkspaces(): Workspace[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Workspace[]) : defaultWorkspaces
  } catch {
    return defaultWorkspaces
  }
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(loadWorkspaces)
  const [selectedId, setSelectedId] = useState<string>(() => {
    try {
      return localStorage.getItem(SELECTED_KEY) ?? 'gemeinsam'
    } catch {
      return 'gemeinsam'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces))
    } catch {
      // ignorieren — reiner Komfort, kein kritischer Zustand
    }
  }, [workspaces])

  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_KEY, selectedId)
    } catch {
      // ignorieren
    }
  }, [selectedId])

  function addWorkspace(name: string) {
    const workspace: Workspace = { id: crypto.randomUUID(), name, kind: 'custom', ownerId: null }
    setWorkspaces((prev) => [...prev, workspace])
    setSelectedId(workspace.id)
  }

  return { workspaces, selectedId, setSelectedId, addWorkspace }
}
