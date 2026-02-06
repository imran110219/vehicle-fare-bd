import { Filter } from "bad-words";

const filter = new Filter();

// Add custom words specific to the context (scam/fraud related to fare disputes)
filter.addWords("scam", "fraud", "cheater", "thief");

export function hasProfanity(text: string): boolean {
  return filter.isProfane(text);
}

export function cleanProfanity(text: string): string {
  return filter.clean(text);
}
