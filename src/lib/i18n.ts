export type Lang = "en" | "bn";

type Dictionary = Record<string, string>;

const en: Dictionary = {
  estimatorTitle: "Fare Estimator",
  pickup: "Pickup",
  drop: "Drop",
  estimate: "Estimate Fare",
  typicalRange: "Typical range",
  communityRange: "Community range",
  reportFare: "Report Fare"
};

const bn: Dictionary = {
  estimatorTitle: "ভাড়া নির্ণায়ক",
  pickup: "পিকআপ",
  drop: "ড্রপ",
  estimate: "ভাড়া নির্ণয় করুন",
  typicalRange: "সাধারণ পরিসীমা",
  communityRange: "কমিউনিটি পরিসীমা",
  reportFare: "ভাড়া রিপোর্ট"
};

export function getDictionary(lang: Lang): Dictionary {
  return lang === "bn" ? bn : en;
}
