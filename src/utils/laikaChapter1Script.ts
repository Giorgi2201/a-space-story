export type Chapter1Beat = {
  lines: string[]
  /** How long the beat stays on screen after it has finished typing. */
  holdMs: number
  /** When true, show the continue prompt instead of auto-advancing. */
  waitForContinue?: boolean
}

export const LAIKA_CHAPTER1_BEATS: Chapter1Beat[] = [
  {
    lines: ['The cold does not bother me anymore.'],
    holdMs: 2000,
  },
  {
    lines: [
      'It never did.',
      'I have slept under park benches, chased pigeons down Gorky Street,',
      'and stolen bread from market stalls when the vendors were not looking.',
      'Moscow is my home.',
      'Every alley, every doorway, every warm grate in the pavement',
      'where the heat rises from below — I know them all.',
    ],
    holdMs: 5000,
  },
  {
    lines: ['My name is Laika.', 'It means barker in Russian.'],
    holdMs: 2500,
  },
  {
    lines: ['I did not know that one morning in 1957, everything would change.'],
    holdMs: 2000,
  },
  {
    lines: [
      'A man in a grey uniform crouched down in the snow',
      'and looked at me — really looked at me —',
      'and held out a piece of sausage.',
    ],
    holdMs: 3000,
  },
  {
    lines: ['I should have run.', 'I always ran.'],
    holdMs: 2000,
  },
  {
    lines: ['But I did not this time.'],
    holdMs: 0,
    waitForContinue: true,
  },
]

export function getBeatFullText(beat: Chapter1Beat): string {
  return beat.lines.join('\n')
}

/** @deprecated Use LAIKA_CHAPTER1_BEATS — kept for progress index count compatibility */
export const LAIKA_CHAPTER1_SEGMENTS = LAIKA_CHAPTER1_BEATS
