import { useCallback, useRef, useState } from 'react'

interface SpeechRecognitionResultLike {
  isFinal: boolean
  0: { transcript: string }
}
interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}
interface SpeechRecognitionLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

function getCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

// Für lange Gespräche: Web-Speech-Recognition beendet sich nach Sprechpausen von
// selbst — solange der Nutzer nicht aktiv "Stopp" gedrückt hat, starten wir sie
// automatisch neu, damit die Mitschrift über das ganze Telefonat hinweg läuft.
export function useLiveTranscription(lang = 'de-DE') {
  const [listening, setListening] = useState(false)
  const [liveText, setLiveText] = useState('')
  const finalTextRef = useRef('')
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const shouldRunRef = useRef(false)

  const supported = getCtor() !== null

  const startRecognitionInstance = useCallback(() => {
    const Ctor = getCtor()
    if (!Ctor) return

    const recognition = new Ctor()
    recognition.lang = lang
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTextRef.current += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }
      setLiveText(finalTextRef.current + interim)
    }
    recognition.onerror = () => {
      /* still handled via onend, das danach feuert */
    }
    recognition.onend = () => {
      if (shouldRunRef.current) {
        // Browser hat die Session beendet (z. B. Stille) — weitermachen, solange aktiv.
        startRecognitionInstance()
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [lang])

  const start = useCallback(() => {
    finalTextRef.current = ''
    setLiveText('')
    shouldRunRef.current = true
    setListening(true)
    startRecognitionInstance()
  }, [startRecognitionInstance])

  const stop = useCallback((): string => {
    shouldRunRef.current = false
    recognitionRef.current?.stop()
    setListening(false)
    return finalTextRef.current.trim()
  }, [])

  return { supported, listening, liveText, start, stop }
}
