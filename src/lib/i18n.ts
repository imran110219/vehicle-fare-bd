export type Lang = "en" | "bn";

type Dictionary = Record<string, string>;

const en: Dictionary = {
  estimatorTitle: "Vehicle Fare Estimator",
  estimate: "Estimate Fare",
  typicalRange: "Typical range",
  communityRange: "Community range",
  reportFare: "Report Fare"
};

const bn: Dictionary = {
  estimatorTitle: "যানবাহন ভাড়া নির্ণায়ক",
  estimate: "ভাড়া নির্ণয় করুন",
  typicalRange: "সাধারণ পরিসীমা",
  communityRange: "কমিউনিটি পরিসীমা",
  reportFare: "ভাড়া রিপোর্ট"
};

export function getDictionary(lang: Lang): Dictionary {
  return lang === "bn" ? bn : en;
}
