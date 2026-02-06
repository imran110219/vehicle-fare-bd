import { getCityLabel, getDictionary, getVehicleTypeLabel, type Lang } from "@/lib/i18n";

describe("getDictionary", () => {
  const requiredKeys = [
    "estimatorTitle",
    "estimatorSubtitle",
    "estimate",
    "typicalRange",
    "communityRange",
    "reportFare",
    "reportCount",
    "reportsCountSuffix",
    "lastUpdated",
    "lowConfidence",
    "submitReport",
    "trustNote",
    "medianLabel",
    "loadingInsights",
    "noCommunityData",
    "communityInsightsTitle",
    "communityInsightsSubtitle",
    "cityLabel",
    "vehicleTypeLabel",
    "timeOfDayLabel",
    "distanceBucketLabel",
    "viewStats",
    "farePaidLabel",
    "estimatedFareUnavailable",
    "youPaidVsEstimated",
    "estimatedLabel",
    "weatherLabel",
    "weatherOptional",
    "passengersLabel",
    "luggageLabel",
    "trafficLabel",
    "distanceLabel",
    "distancePlaceholder",
    "fareEstimateTitle",
    "baseFareLabel",
    "distanceFareLabel",
    "multiplierLabel",
    "totalLabel",
    "estimatePrompt",
    "estimateError",
    "reportTitle",
    "reportSubtitle",
    "pickupPlaceholder",
    "dropPlaceholder",
    "farePaidPlaceholder",
    "reportSubmit",
    "negotiationLabel",
    "notesPlaceholder",
    "signInRequiredTitle",
    "signInRequiredBody",
    "signInLabel",
    "profileTitle",
    "profileSubtitle",
    "profileShowing",
    "profileNoSubmissions",
    "pageLabel",
    "previousLabel",
    "nextLabel",
    "navReport",
    "navInsights",
    "navProfile",
    "navAdmin",
    "navSignedInAs"
  ];

  describe("English dictionary", () => {
    const dict = getDictionary("en");

    it("contains all required keys", () => {
      for (const key of requiredKeys) {
        expect(dict[key]).toBeDefined();
        expect(typeof dict[key]).toBe("string");
        expect(dict[key].length).toBeGreaterThan(0);
      }
    });

    it("returns English estimator title", () => {
      expect(dict.estimatorTitle).toBe("Vehicle Fare Estimator");
    });

    it("returns English estimate button text", () => {
      expect(dict.estimate).toBe("Estimate Fare");
    });

    it("returns English typical range label", () => {
      expect(dict.typicalRange).toBe("Typical range");
    });

    it("returns English community range label", () => {
      expect(dict.communityRange).toBe("Community range");
    });

    it("returns English report fare label", () => {
      expect(dict.reportFare).toBe("Report Fare");
    });
  });

  describe("Bangla dictionary", () => {
    const dict = getDictionary("bn");

    it("contains all required keys", () => {
      for (const key of requiredKeys) {
        expect(dict[key]).toBeDefined();
        expect(typeof dict[key]).toBe("string");
        expect(dict[key].length).toBeGreaterThan(0);
      }
    });

    it("returns non-ASCII Bangla text for all keys", () => {
      for (const key of requiredKeys) {
        // Bangla characters should have char codes > 127
        const hasNonAscii = [...dict[key]].some(
          (char) => char.charCodeAt(0) > 127
        );
        expect(hasNonAscii).toBe(true);
      }
    });
  });

  describe("language selection", () => {
    it("returns English for 'en'", () => {
      const dict = getDictionary("en");
      expect(dict.estimatorTitle).toBe("Vehicle Fare Estimator");
    });

    it("returns Bangla for 'bn'", () => {
      const dict = getDictionary("bn");
      // Should not be English
      expect(dict.estimatorTitle).not.toBe("Vehicle Fare Estimator");
    });

    it("returns different content for different languages", () => {
      const enDict = getDictionary("en");
      const bnDict = getDictionary("bn");

      for (const key of requiredKeys) {
        expect(enDict[key]).not.toBe(bnDict[key]);
      }
    });

    it("has same keys for both languages", () => {
      const enDict = getDictionary("en");
      const bnDict = getDictionary("bn");
      const enKeys = Object.keys(enDict).sort();
      const bnKeys = Object.keys(bnDict).sort();
      expect(enKeys).toEqual(bnKeys);
    });
  });

  describe("label helpers", () => {
    it("returns localized city labels", () => {
      expect(getCityLabel("en", "DHAKA")).toBe("Dhaka");
      expect(getCityLabel("bn", "DHAKA")).not.toBe("Dhaka");
    });

    it("returns localized vehicle type labels", () => {
      expect(getVehicleTypeLabel("en", "RICKSHAW")).toBe("Rickshaw");
      expect(getVehicleTypeLabel("bn", "RICKSHAW")).not.toBe("Rickshaw");
    });
  });
});
