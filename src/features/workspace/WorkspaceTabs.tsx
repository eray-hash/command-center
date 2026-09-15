import { useState } from 'react'
import type { Workspace } from '../../types/workspace'

export function WorkspaceTabs({
  workspaces,
  selectedId,
  onSelect,
  onCreate,
}: {
  workspaces: Workspace[]
  selectedId: string
  onSelect: (id: string) => void
  onCreate: (name: string) => void
}) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  function submitCreate() {
    const trimmed = name.trim()
    if (trimmed) onCreate(trimmed)
    setName('')
    setCreating(false)
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {workspaces.map((ws) => (
        <button
          key={ws.id}
          onClick={() => onSelect(ws.id)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            selectedId === ws.id ? 'bg-brand-violet text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          {ws.name}
        </button>
      ))}

      {creating ? (
        <span className="flex items-center gap-1">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitCreate()}
            placeholder="Name des Bereichs"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm outline-none focus:border-brand-teal"
          />
          <button onClick={submitCreate} className="rounded-full bg-brand-teal px-3 py-1.5 text-sm">
            ✓
          </button>
        </span>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="rounded-full border border-dashed border-white/20 px-3 py-1.5 text-sm text-white/40 hover:text-white/70"
        >
          + Bereich
        </button>
      )}
    </div>
  )
}
