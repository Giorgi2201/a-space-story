const DOGS = [
  { name: 'Laika', weight: 5.2, calmness: 9 },
  { name: 'Albina', weight: 5.8, calmness: 7 },
  { name: 'Mushka', weight: 6.3, calmness: 9 },
  { name: 'Dymka', weight: 4.9, calmness: 6 },
]

export const LAIKA_SELECTION_STARTER_CODE = `const dogs = [
  { name: "Laika", weight: 5.2, calmness: 9 },
  { name: "Albina", weight: 5.8, calmness: 7 },
  { name: "Mushka", weight: 6.3, calmness: 9 },
  { name: "Dymka", weight: 4.9, calmness: 6 },
];

function findCandidates(dogs) {
  return dogs.filter(dog => _____ && _____);
}`

function namesFromResult(result: unknown): string[] | null {
  if (!Array.isArray(result)) {
    return null
  }

  const names: string[] = []
  for (const entry of result) {
    if (!entry || typeof entry !== 'object' || !('name' in entry)) {
      return null
    }
    const name = (entry as { name: unknown }).name
    if (typeof name !== 'string') {
      return null
    }
    names.push(name)
  }

  return names
}

function runFindCandidates(code: string): unknown {
  const runner = new Function(`
    "use strict";
    ${code}
    if (typeof findCandidates !== "function") return null;
    if (typeof dogs === "undefined") return null;
    return findCandidates(dogs);
  `) as () => unknown

  return runner()
}

export function evaluateLaikaCandidates(code: string): boolean {
  try {
    const result = runFindCandidates(code)
    const names = namesFromResult(result)
    if (!names) {
      return false
    }

    return names.length === 1 && names[0] === 'Laika'
  } catch {
    try {
      const fallback = new Function(
        'dogs',
        `
        "use strict";
        ${code}
        if (typeof findCandidates !== "function") return null;
        return findCandidates(dogs);
      `,
      ) as (dogs: typeof DOGS) => unknown

      const result = fallback(DOGS)
      const names = namesFromResult(result)
      if (!names) {
        return false
      }

      return names.length === 1 && names[0] === 'Laika'
    } catch {
      return false
    }
  }
}
