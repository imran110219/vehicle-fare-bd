import type { City, VehicleType } from "@prisma/client";

export type Lang = "en" | "bn";

type Dictionary = Record<string, string>;

const en: Dictionary = {
  estimatorTitle: "Vehicle Fare Estimator",
  estimatorSubtitle: "Estimate fair vehicle fares in Bangladesh using city pricing and community data.",
  estimate: "Estimate Fare",
  typicalRange: "Typical range",
  communityRange: "Community range",
  reportFare: "Report Fare",
  reportCount: "Report count",
  reportsCountSuffix: "{count} reports",
  lastUpdated: "Last updated",
  lowConfidence: "Low confidence",
  submitReport: "Submit a fare report",
  trustNote: "Based on community submissions. Accuracy improves as more reports come in.",
  medianLabel: "Median",
  loadingInsights: "Loading insights...",
  noCommunityData: "No community data for this filter yet.",
  communityInsightsTitle: "Community insights",
  communityInsightsSubtitle: "See aggregated fares based on real submissions.",
  cityLabel: "City",
  vehicleTypeLabel: "Vehicle type",
  timeOfDayLabel: "Time of day",
  distanceBucketLabel: "Distance bucket",
  viewStats: "View stats",
  farePaidLabel: "Fare paid",
  estimatedFareUnavailable: "Estimated fare unavailable.",
  youPaidVsEstimated: "You paid vs estimated",
  estimatedLabel: "Estimated",
  weatherLabel: "Weather",
  weatherOptional: "Optional",
  passengersLabel: "Passengers",
  luggageLabel: "Luggage",
  trafficLabel: "Heavy traffic",
  distanceLabel: "Distance (km)",
  distancePlaceholder: "Enter distance",
  fareEstimateTitle: "Fare estimate",
  baseFareLabel: "Base fare",
  distanceFareLabel: "Distance fare",
  multiplierLabel: "Multiplier",
  totalLabel: "Total",
  estimatePrompt: "Select a city and distance to see estimates.",
  estimateError: "Please provide a valid distance and inputs.",
  reportTitle: "Submit a fare report",
  reportSubtitle: "Share what you paid so the community can see fair ranges.",
  pickupPlaceholder: "Pickup area",
  // Popular Routes
  popularRoutesTitle: "Popular Routes",
  popularRoutesSubtitle: "See the most frequently traveled routes and their typical fares based on community data.",
  navRoutes: "Routes",
  allCities: "All Cities",
  allVehicles: "All Vehicles",
  applyFilters: "Apply Filters",
  noPopularRoutes: "No popular routes found for these filters. Try adjusting your filters or check back later.",
  popularRoutesCount: "Popular Routes",
  totalTrips: "Total Trips Reported",
  citiesCovered: "Cities Covered",
  tripsLabel: "trips",
  avgDistance: "Avg",
  fareRangeLabel: "Range",
  reportedToday: "Reported today",
  daysAgo: "days ago",
  quickEstimate: "Quick Estimate",
  dropPlaceholder: "Drop area",
  farePaidPlaceholder: "Fare paid (BDT)",
  reportSubmit: "Submit report",
  negotiationLabel: "Negotiation",
  notesPlaceholder: "Notes (optional)",
  signInRequiredTitle: "Sign in required",
  signInRequiredBody: "Please sign in to submit fare reports.",
  signInLabel: "Sign in",
  profileTitle: "My submissions",
  profileSubtitle: "Track your submitted fares.",
  profileShowing: "Showing {shown} of {total} reports.",
  profileNoSubmissions: "No submissions yet.",
  pageLabel: "Page",
  previousLabel: "Previous",
  nextLabel: "Next",
  navReport: "Report",
  navInsights: "Insights",
  navProfile: "Profile",
  navAdmin: "Admin",
  navSignedInAs: "Signed in as"
};

const bn: Dictionary = {
  estimatorTitle: "যানবাহন ভাড়া নির্ণায়ক",
  estimatorSubtitle: "বাংলাদেশে শহরভিত্তিক ভাড়া ও কমিউনিটি ডেটা দিয়ে ন্যায্য ভাড়া অনুমান করুন।",
  estimate: "ভাড়া নির্ণয় করুন",
  typicalRange: "সাধারণ পরিসীমা",
  communityRange: "কমিউনিটি পরিসীমা",
  reportFare: "ভাড়া রিপোর্ট",
  reportCount: "রিপোর্টের সংখ্যা",
  reportsCountSuffix: "{count} টি রিপোর্ট",
  lastUpdated: "সর্বশেষ আপডেট",
  lowConfidence: "নিম্ন আস্থা",
  submitReport: "একটি ভাড়া রিপোর্ট করুন",
  trustNote: "কমিউনিটি রিপোর্টের উপর ভিত্তি করে। আরও রিপোর্টে নির্ভুলতা বাড়ে।",
  medianLabel: "মধ্যমান",
  loadingInsights: "ইনসাইট লোড হচ্ছে...",
  noCommunityData: "এই ফিল্টারের জন্য কোনো ডেটা নেই।",
  communityInsightsTitle: "কমিউনিটি ইনসাইট",
  communityInsightsSubtitle: "বাস্তব রিপোর্টের উপর ভিত্তি করে সামগ্রিক ভাড়া দেখুন।",
  cityLabel: "শহর",
  vehicleTypeLabel: "যানবাহনের ধরন",
  timeOfDayLabel: "সময়",
  distanceBucketLabel: "দূরত্বের পরিসীমা",
  viewStats: "পরিসংখ্যান দেখুন",
  farePaidLabel: "প্রদত্ত ভাড়া",
  estimatedFareUnavailable: "অনুমানিক ভাড়া পাওয়া যায়নি।",
  youPaidVsEstimated: "আপনি দিয়েছেন বনাম অনুমান",
  estimatedLabel: "অনুমানিক",
  weatherLabel: "আবহাওয়া",
  weatherOptional: "ঐচ্ছিক",
  passengersLabel: "যাত্রী",
  luggageLabel: "লাগেজ",
  trafficLabel: "ভীষণ যানজট",
  distanceLabel: "দূরত্ব (কিমি)",
  distancePlaceholder: "দূরত্ব লিখুন",
  fareEstimateTitle: "ভাড়া অনুমান",
  baseFareLabel: "মূল ভাড়া",
  distanceFareLabel: "দূরত্ব ভাড়া",
  multiplierLabel: "গুণক",
  totalLabel: "মোট",
  estimatePrompt: "অনুমান দেখতে শহর ও দূরত্ব বাছাই করুন।",
  estimateError: "সঠিক দূরত্ব ও তথ্য দিন।",
  reportTitle: "ভাড়া রিপোর্ট জমা দিন",
  reportSubtitle: "কমিউনিটি পরিসীমা উন্নত করতে আপনার পরিশোধিত ভাড়া শেয়ার করুন।",
  pickupPlaceholder: "যাত্রা শুরুর স্থান",
  dropPlaceholder: "গন্তব্য",
  farePaidPlaceholder: "প্রদত্ত ভাড়া (BDT)",
  reportSubmit: "রিপোর্ট জমা দিন",
  negotiationLabel: "দরাদরি",
  notesPlaceholder: "নোট (ঐচ্ছিক)",
  signInRequiredTitle: "সাইন ইন প্রয়োজন",
  signInRequiredBody: "রিপোর্ট দিতে সাইন ইন করুন।",
  signInLabel: "সাইন ইন",
  profileTitle: "আমার জমা",
  profileSubtitle: "আপনার জমা দেওয়া ভাড়াগুলো দেখুন।",
  profileShowing: "{shown} টি দেখানো হচ্ছে, মোট {total} টি রিপোর্ট।",
  profileNoSubmissions: "এখনও কোনো জমা নেই।",
  pageLabel: "পৃষ্ঠা",
  previousLabel: "আগের",
  nextLabel: "পরের",
  navReport: "রিপোর্ট",
  navInsights: "ইনসাইট",
  navProfile: "প্রোফাইল",
  navAdmin: "অ্যাডমিন",
  navSignedInAs: "সাইন ইন করেছেন",
  // Popular Routes
  popularRoutesTitle: "জনপ্রিয় রুট",
  popularRoutesSubtitle: "কমিউনিটি ডেটার উপর ভিত্তি করে সবচেয়ে ঘন ঘন ভ্রমণকৃত রুট এবং তাদের সাধারণ ভাড়া দেখুন।",
  navRoutes: "রুট",
  allCities: "সব শহর",
  allVehicles: "সব যানবাহন",
  applyFilters: "ফিল্টার প্রয়োগ করুন",
  noPopularRoutes: "এই ফিল্টারের জন্য কোনো জনপ্রিয় রুট নেই। ফিল্টার সমন্বয় করুন বা পরে আবার চেক করুন।",
  popularRoutesCount: "জনপ্রিয় রুট",
  totalTrips: "মোট রিপোর্ট করা ট্রিপ",
  citiesCovered: "শহর কভার করা হয়েছে",
  tripsLabel: "ট্রিপ",
  avgDistance: "গড়",
  fareRangeLabel: "পরিসীমা",
  reportedToday: "আজ রিপোর্ট করা হয়েছে",
  daysAgo: "দিন আগে",
  quickEstimate: "দ্রুত নির্ণয়"
};

export function getDictionary(lang: Lang): Dictionary {
  return lang === "bn" ? bn : en;
}

const cityLabels: Record<Lang, Record<City, string>> = {
  en: {
    BARISHAL: "Barishal",
    BOGURA: "Bogura",
    CHATTOGRAM: "Chattogram",
    CUMILLA: "Cumilla",
    DHAKA: "Dhaka",
    DINAJPUR: "Dinajpur",
    FENI: "Feni",
    GAZIPUR: "Gazipur",
    JASHORE: "Jashore",
    KHULNA: "Khulna",
    KUSHTIA: "Kushtia",
    MYMENSINGH: "Mymensingh",
    NARAYANGANJ: "Narayanganj",
    NOAKHALI: "Noakhali",
    PABNA: "Pabna",
    RAJSHAHI: "Rajshahi",
    RANGPUR: "Rangpur",
    SAVAR: "Savar",
    SYLHET: "Sylhet",
    TANGAIL: "Tangail",
    OTHER: "Other"
  },
  bn: {
    BARISHAL: "বরিশাল",
    BOGURA: "বগুড়া",
    CHATTOGRAM: "চট্টগ্রাম",
    CUMILLA: "কুমিল্লা",
    DHAKA: "ঢাকা",
    DINAJPUR: "দিনাজপুর",
    FENI: "ফেনী",
    GAZIPUR: "গাজীপুর",
    JASHORE: "যশোর",
    KHULNA: "খুলনা",
    KUSHTIA: "কুষ্টিয়া",
    MYMENSINGH: "ময়মনসিংহ",
    NARAYANGANJ: "নারায়ণগঞ্জ",
    NOAKHALI: "নোয়াখালী",
    PABNA: "পাবনা",
    RAJSHAHI: "রাজশাহী",
    RANGPUR: "রংপুর",
    SAVAR: "সাভার",
    SYLHET: "সিলেট",
    TANGAIL: "টাঙ্গাইল",
    OTHER: "অন্যান্য"
  }
};

const vehicleTypeLabels: Record<Lang, Record<VehicleType, string>> = {
  en: {
    RICKSHAW: "Rickshaw",
    CNG: "CNG",
    AUTO_RICKSHAW: "Auto-rickshaw",
    BIKE: "Bike",
    CAR: "Car",
    MICROBUS: "Microbus",
    BUS: "Bus",
    OTHER: "Other"
  },
  bn: {
    RICKSHAW: "রিকশা",
    CNG: "সিএনজি",
    AUTO_RICKSHAW: "অটো-রিকশা",
    BIKE: "বাইক",
    CAR: "কার",
    MICROBUS: "মাইক্রোবাস",
    BUS: "বাস",
    OTHER: "অন্যান্য"
  }
};

export function getCityLabel(lang: Lang, city: City) {
  return cityLabels[lang][city] ?? city;
}

export function getVehicleTypeLabel(lang: Lang, vehicleType: VehicleType) {
  return vehicleTypeLabels[lang][vehicleType] ?? vehicleType;
}

const timeOfDayLabels: Record<Lang, Record<"MORNING" | "AFTERNOON" | "EVENING" | "NIGHT", string>> = {
  en: {
    MORNING: "Morning",
    AFTERNOON: "Afternoon",
    EVENING: "Evening",
    NIGHT: "Night"
  },
  bn: {
    MORNING: "সকাল",
    AFTERNOON: "দুপুর",
    EVENING: "সন্ধ্যা",
    NIGHT: "রাত"
  }
};

const weatherLabels: Record<Lang, Record<"CLEAR" | "RAIN", string>> = {
  en: {
    CLEAR: "Clear",
    RAIN: "Rain"
  },
  bn: {
    CLEAR: "পরিষ্কার",
    RAIN: "বৃষ্টি"
  }
};

const negotiationLabels: Record<Lang, Record<"EASY" | "MEDIUM" | "HARD", string>> = {
  en: {
    EASY: "Easy",
    MEDIUM: "Medium",
    HARD: "Hard"
  },
  bn: {
    EASY: "সহজ",
    MEDIUM: "মাঝারি",
    HARD: "কঠিন"
  }
};

const distanceBucketLabels: Record<Lang, Record<string, string>> = {
  en: {
    KM_0_1: "0-1 km",
    KM_1_2: "1-2 km",
    KM_2_3: "2-3 km",
    KM_3_5: "3-5 km",
    KM_5_8: "5-8 km",
    KM_8_PLUS: "8+ km"
  },
  bn: {
    KM_0_1: "০-১ কিমি",
    KM_1_2: "১-২ কিমি",
    KM_2_3: "২-৩ কিমি",
    KM_3_5: "৩-৫ কিমি",
    KM_5_8: "৫-৮ কিমি",
    KM_8_PLUS: "৮+ কিমি"
  }
};

export function getTimeOfDayLabel(lang: Lang, timeOfDay: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT") {
  return timeOfDayLabels[lang][timeOfDay] ?? timeOfDay;
}

export function getWeatherLabel(lang: Lang, weather: "CLEAR" | "RAIN") {
  return weatherLabels[lang][weather] ?? weather;
}

export function getNegotiationLabel(lang: Lang, level: "EASY" | "MEDIUM" | "HARD") {
  return negotiationLabels[lang][level] ?? level;
}

export function getDistanceBucketLabel(lang: Lang, bucket: string) {
  return distanceBucketLabels[lang][bucket] ?? bucket;
}
