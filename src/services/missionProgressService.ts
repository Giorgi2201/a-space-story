import { apiBaseUrl } from './api'
import { getToken } from './authService'

export type LaikaMissionPhase = 'narrative' | 'exercise' | 'chapter2'

export type LaikaMissionProgress = {
  missionId: string
  currentChapter: number
  phase: LaikaMissionPhase
  narrativeSegmentIndex: number
  lastCompletedChapter: number
}

export type UpdateLaikaMissionProgressPayload = {
  currentChapter?: number
  phase: LaikaMissionPhase
  narrativeSegmentIndex: number
  lastCompletedChapter?: number
}

const defaultProgress: LaikaMissionProgress = {
  missionId: 'laika',
  currentChapter: 1,
  phase: 'narrative',
  narrativeSegmentIndex: 0,
  lastCompletedChapter: 0,
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function normalizeProgress(data: Partial<LaikaMissionProgress>): LaikaMissionProgress {
  const phase = data.phase ?? defaultProgress.phase
  const safePhase: LaikaMissionPhase =
    phase === 'exercise' || phase === 'chapter2' ? phase : 'narrative'

  return {
    missionId: data.missionId ?? defaultProgress.missionId,
    currentChapter: data.currentChapter ?? defaultProgress.currentChapter,
    phase: safePhase,
    narrativeSegmentIndex: data.narrativeSegmentIndex ?? defaultProgress.narrativeSegmentIndex,
    lastCompletedChapter: data.lastCompletedChapter ?? defaultProgress.lastCompletedChapter,
  }
}

export async function fetchLaikaMissionProgress(): Promise<LaikaMissionProgress> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/mission/laika/progress`, {
      headers: authHeaders(),
    })

    if (!response.ok) {
      return defaultProgress
    }

    const data = (await response.json()) as Partial<LaikaMissionProgress>
    return normalizeProgress(data)
  } catch {
    return defaultProgress
  }
}

export async function saveLaikaMissionProgress(
  payload: UpdateLaikaMissionProgressPayload,
): Promise<LaikaMissionProgress | null> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/mission/laika/progress`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        currentChapter: payload.currentChapter ?? 1,
        phase: payload.phase,
        narrativeSegmentIndex: payload.narrativeSegmentIndex,
        lastCompletedChapter: payload.lastCompletedChapter,
      }),
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as Partial<LaikaMissionProgress>
    return normalizeProgress(data)
  } catch {
    return null
  }
}

export async function completeLaikaChapter1(): Promise<LaikaMissionProgress | null> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/mission/laika/chapters/1/complete`, {
      method: 'POST',
      headers: authHeaders(),
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as Partial<LaikaMissionProgress>
    return normalizeProgress(data)
  } catch {
    return null
  }
}
