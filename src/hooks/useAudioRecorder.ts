import { useCallback, useRef, useState } from 'react'

export function useAudioRecorder() {
  const [recording, setRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startedAtRef = useRef<number>(0)

  const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices && typeof MediaRecorder !== 'undefined'

  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mediaRecorderRef.current = recorder
      startedAtRef.current = Date.now()
      recorder.start()
      setRecording(true)
    } catch {
      setError('Mikrofon-Zugriff wurde verweigert oder ist nicht verfügbar.')
    }
  }, [])

  const stop = useCallback((): Promise<{ blob: Blob; durationSec: number } | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder) {
        resolve(null)
        return
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const durationSec = Math.round((Date.now() - startedAtRef.current) / 1000)
        recorder.stream.getTracks().forEach((t) => t.stop())
        setRecording(false)
        resolve({ blob, durationSec })
      }
      recorder.stop()
    })
  }, [])

  return { supported, recording, error, start, stop }
}
