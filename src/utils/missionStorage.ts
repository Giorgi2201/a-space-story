const LAIKA_STARTED_KEY = 'laikaMissionStarted'

export function hasLaikaMissionStarted(): boolean {
  return localStorage.getItem(LAIKA_STARTED_KEY) === 'true'
}

export function markLaikaMissionStarted(): void {
  localStorage.setItem(LAIKA_STARTED_KEY, 'true')
}
