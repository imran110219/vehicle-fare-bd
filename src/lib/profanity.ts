const banned = ["scam", "fraud", "fuck", "shit", "bitch"];

export function hasProfanity(text: string) {
  const lower = text.toLowerCase();
  return banned.some((word) => lower.includes(word));
}
