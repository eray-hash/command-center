import { VoiceCaptureField } from '../agenda/VoiceCaptureField'

export function IdeaCaptureBar({ onSubmit }: { onSubmit: (text: string) => void }) {
  return (
    <section className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
      <h2 className="mb-1 text-sm font-semibold text-white/80">Neue Idee</h2>
      <p className="mb-3 text-xs text-white/40">
        Per Sprache oder Text — landet als Task in „Ideen &amp; Neukunden", bis du sie einem Projekt zuordnest.
      </p>
      <VoiceCaptureField placeholder="Neue Idee…" onSubmit={onSubmit} />
    </section>
  )
}
