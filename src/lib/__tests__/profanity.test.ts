// Mock the bad-words module since it uses ESM
jest.mock("bad-words", () => {
  return {
    Filter: jest.fn().mockImplementation(() => ({
      addWords: jest.fn(),
      isProfane: jest.fn((text: string) => {
        const lower = text.toLowerCase();
        const badWords = [
          "shit", "fuck", "damn", "ass", "bitch",
          "scam", "fraud", "cheater", "thief"
        ];
        return badWords.some((word) => lower.includes(word));
      }),
      clean: jest.fn((text: string) => {
        const lower = text.toLowerCase();
        const badWords = ["shit", "fuck", "damn", "ass", "bitch"];
        let result = text;
        for (const word of badWords) {
          if (lower.includes(word)) {
            result = result.replace(new RegExp(word, "gi"), "****");
          }
        }
        return result;
      })
    }))
  };
});

import { hasProfanity, cleanProfanity } from "@/lib/profanity";

describe("hasProfanity", () => {
  it("detects common profanity", () => {
    expect(hasProfanity("this is shit")).toBe(true);
    expect(hasProfanity("what the fuck")).toBe(true);
  });

  it("detects custom words (scam/fraud)", () => {
    expect(hasProfanity("this is a scam")).toBe(true);
    expect(hasProfanity("total fraud")).toBe(true);
    expect(hasProfanity("he is a cheater")).toBe(true);
    expect(hasProfanity("thief driver")).toBe(true);
  });

  it("returns false for clean text", () => {
    expect(hasProfanity("nice ride from dhanmondi")).toBe(false);
    expect(hasProfanity("fair price for the distance")).toBe(false);
    expect(hasProfanity("good service")).toBe(false);
  });

  it("handles empty string", () => {
    expect(hasProfanity("")).toBe(false);
  });

  it("handles mixed case", () => {
    expect(hasProfanity("This is SCAM")).toBe(true);
    expect(hasProfanity("FRAUD alert")).toBe(true);
  });
});

describe("cleanProfanity", () => {
  it("replaces profanity with placeholders", () => {
    const result = cleanProfanity("this is shit");
    expect(result).not.toContain("shit");
    expect(result).toContain("****");
  });

  it("preserves clean text", () => {
    const text = "nice ride from dhanmondi to gulshan";
    expect(cleanProfanity(text)).toBe(text);
  });
});
