const HAS_SEEN_INTRO_KEY = 'hasSeenIntro'

export function hasSeenIntro(): boolean {
  return localStorage.getItem(HAS_SEEN_INTRO_KEY) === 'true'
}

export function markIntroSeen(): void {
  localStorage.setItem(HAS_SEEN_INTRO_KEY, 'true')
}
