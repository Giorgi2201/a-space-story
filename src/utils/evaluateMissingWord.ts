const STARTER_CODE = `function MissingWord() {
  return "";
}`

export { STARTER_CODE }

export function evaluateMissingWord(code: string): string | null {
  try {
    const runner = new Function(`
      "use strict";
      ${code}
      if (typeof MissingWord !== "function") return null;
      const result = MissingWord();
      return typeof result === "string" ? result : null;
    `) as () => string | null

    return runner()
  } catch {
    return null
  }
}
