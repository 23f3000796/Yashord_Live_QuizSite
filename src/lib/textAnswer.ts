/**
 * Checking a typed answer ("Guess the gadget").
 *
 * Lenient by design: capitals, spaces, punctuation and accents never
 * matter, small spelling slips are forgiven, a filler word like "logo" or
 * "the" is ignored, and each question can list alternate names. What it
 * does NOT do is accept an answer that merely CONTAINS the right word —
 * otherwise typing "mouse drone charger" would score on all three.
 */

const FILLER = new Set([
  "a", "an", "the", "logo", "brand", "company", "app", "device", "gadget", "its", "it", "is",
]);

/** Words, lowercased, accents and punctuation removed, filler dropped. */
function words(s: string): string[] {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter((w) => w && !FILLER.has(w));
}

/** Comparable form: words joined with no spaces ("Air-Cannon" -> "aircannon"). */
export function normalizeAnswer(s: string): string {
  return words(s).join("");
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = cur;
  }
  return prev[b.length];
}

/** Typos forgiven for an answer of this length. Short names must be exact. */
function tolerance(len: number): number {
  if (len <= 4) return 0;
  if (len <= 8) return 1;
  return 2;
}

/** Whether `typed` counts as `main` or any of `alternates`. */
export function isAcceptedAnswer(
  typed: string,
  main: string,
  alternates: readonly string[] = []
): boolean {
  const t = normalizeAnswer(typed);
  if (!t) return false;
  for (const candidate of [main, ...alternates]) {
    const c = normalizeAnswer(candidate);
    if (!c) continue;
    if (t === c) return true;
    if (levenshtein(t, c) <= tolerance(c.length)) return true;
  }
  return false;
}

/** "Hopter" -> 1, "Air cannon" -> 2. Drives the "2-word answer" hint. */
export function wordCount(answer: string): number {
  return answer.trim().split(/\s+/).filter(Boolean).length;
}

/** The longest typed answer we store. */
export const MAX_TEXT_ANSWER = 60;
