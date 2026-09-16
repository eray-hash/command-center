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
            selectedId === ws.id ? 'bg-brand-violet text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
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
            className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-teal"
          />
          <button onClick={submitCreate} className="rounded-full bg-brand-teal px-3 py-1.5 text-sm">
            ✓
          </button>
        </span>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="rounded-full border border-dashed border-gray-300 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-700"
        >
          + Bereich
        </button>
      )}
    </div>
  )
}
