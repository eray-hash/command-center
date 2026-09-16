import { useEffect, useState } from 'react'
import type { Project } from '../../types/project'
import { useVoiceInput } from '../../hooks/useVoiceInput'
import { useSpeechOutput } from '../../hooks/useSpeechOutput'
import { findProjectForQuery, buildProjectAnswer } from '../../lib/voiceQuery'

export function VoiceQuery({ projects }: { projects: Project[] }) {
  const { supported, listening, transcript, start, stop } = useVoiceInput()
  const { supported: ttsSupported, speaking, speak, stop: stopSpeaking } = useSpeechOutput()
  const [answer, setAnswer] = useState<string | null>(null)
  const [question, setQuestion] = useState<string | null>(null)

  function handleToggle() {
    if (listening) {
      stop()
      return
    }
    setAnswer(null)
    setQuestion(null)
    start()
  }

  // Die Spracherkennung setzt `listening` selbst auf false, sobald sie nach einer
  // Sprechpause automatisch endet — genau dann werten wir den Transkript-Text aus.
  useEffect(() => {
    if (listening || !transcript.trim() || question) return
    setQuestion(transcript)
    const project = findProjectForQuery(transcript, projects)
    const responseText = project
      ? buildProjectAnswer(project)
      : `Ich konnte kein Projekt zu "${transcript}" finden. Frag z. B. "Wie steht Mayer Holding?"`
    setAnswer(responseText)
    if (ttsSupported) speak(responseText)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, transcript])

  if (!supported) {
    return (
      <p className="mb-4 text-xs text-gray-400">
        Sprachabfrage in diesem Browser nicht verfügbar (Web Speech API fehlt).
      </p>
    )
  }

  return (
    <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggle}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg transition ${
            listening ? 'animate-pulse bg-red-600' : 'bg-brand-violet'
          }`}
          title="Frag das Dashboard"
        >
          🎙️
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-gray-800">Frag das Dashboard</h2>
          <p className="text-xs text-gray-400">z. B. „Wie steht das Projekt bei Mayer Holding?"</p>
        </div>
        {speaking && (
          <button onClick={stopSpeaking} className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs">
            ⏹ Stopp
          </button>
        )}
      </div>

      {listening && <p className="mt-3 text-sm text-gray-500 italic">Höre zu… „{transcript}"</p>}

      {!listening && question && (
        <div className="mt-3 rounded-lg bg-white p-3 text-sm">
          <p className="text-gray-400">Du: {question}</p>
          <p className="mt-1 text-gray-900">{answer}</p>
        </div>
      )}
    </section>
  )
}
