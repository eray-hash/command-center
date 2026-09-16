import { VoiceCaptureField } from '../agenda/VoiceCaptureField'

export function IdeaCaptureBar({ onSubmit }: { onSubmit: (text: string) => void }) {
  return (
    <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="mb-1 text-sm font-semibold text-gray-800">Neue Idee</h2>
      <p className="mb-3 text-xs text-gray-400">
        Per Sprache oder Text — landet als Task in „Ideen &amp; Neukunden", bis du sie einem Projekt zuordnest.
      </p>
      <VoiceCaptureField placeholder="Neue Idee…" onSubmit={onSubmit} />
    </section>
  )
}
