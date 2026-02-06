import { loginSchema, registerSchema, estimateSchema, reportSchema } from "@/lib/validation";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123"
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "invalid-email",
      password: "password123"
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "12345"
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty fields", () => {
    expect(loginSchema.safeParse({ email: "", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({}).success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "securepass"
    });
    expect(result.success).toBe(true);
  });

  it("rejects name too short", () => {
    const result = registerSchema.safeParse({
      name: "J",
      email: "john@example.com",
      password: "securepass"
    });
    expect(result.success).toBe(false);
  });

  it("rejects name too long", () => {
    const result = registerSchema.safeParse({
      name: "A".repeat(51),
      email: "john@example.com",
      password: "securepass"
    });
    expect(result.success).toBe(false);
  });
});

describe("estimateSchema", () => {
  const validEstimate = {
    city: "DHAKA",
    vehicleType: "RICKSHAW",
    distanceKm: 5,
    timeOfDay: "MORNING",
    passengerCount: 1,
    luggage: false,
    traffic: false
  };

  it("accepts valid estimate", () => {
    const result = estimateSchema.safeParse(validEstimate);
    expect(result.success).toBe(true);
  });

  it("accepts optional weather", () => {
    const result = estimateSchema.safeParse({
      ...validEstimate,
      weather: "RAIN"
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid city", () => {
    const result = estimateSchema.safeParse({
      ...validEstimate,
      city: "INVALID_CITY"
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative distance", () => {
    const result = estimateSchema.safeParse({
      ...validEstimate,
      distanceKm: -1
    });
    expect(result.success).toBe(false);
  });

  it("rejects distance over 50km", () => {
    const result = estimateSchema.safeParse({
      ...validEstimate,
      distanceKm: 51
    });
    expect(result.success).toBe(false);
  });

  it("rejects passenger count out of range", () => {
    expect(
      estimateSchema.safeParse({ ...validEstimate, passengerCount: 0 }).success
    ).toBe(false);
    expect(
      estimateSchema.safeParse({ ...validEstimate, passengerCount: 4 }).success
    ).toBe(false);
  });

  it("accepts all valid cities", () => {
    const cities = [
      "DHAKA", "CHATTOGRAM", "KHULNA", "RAJSHAHI", "SYLHET",
      "GAZIPUR", "NARAYANGANJ", "MYMENSINGH", "BARISHAL", "CUMILLA",
      "RANGPUR", "BOGURA", "SAVAR", "KUSHTIA", "JASHORE",
      "TANGAIL", "DINAJPUR", "FENI", "NOAKHALI", "PABNA", "OTHER"
    ];
    for (const city of cities) {
      const result = estimateSchema.safeParse({ ...validEstimate, city });
      expect(result.success).toBe(true);
    }
  });

  it("accepts all valid vehicle types", () => {
    const vehicleTypes = [
      "RICKSHAW", "CNG", "AUTO_RICKSHAW", "BIKE",
      "CAR", "MICROBUS", "BUS", "OTHER"
    ];
    for (const vehicleType of vehicleTypes) {
      const result = estimateSchema.safeParse({ ...validEstimate, vehicleType });
      expect(result.success).toBe(true);
    }
  });
});

describe("reportSchema", () => {
  const validReport = {
    city: "DHAKA",
    vehicleType: "CNG",
    pickupArea: "Dhanmondi",
    dropArea: "Gulshan",
    distanceKm: 5.5,
    farePaid: 150,
    timeOfDay: "EVENING",
    passengerCount: 2,
    luggage: false,
    traffic: true,
    negotiation: "MEDIUM"
  };

  it("accepts valid report", () => {
    const result = reportSchema.safeParse(validReport);
    expect(result.success).toBe(true);
  });

  it("accepts optional weather and notes", () => {
    const result = reportSchema.safeParse({
      ...validReport,
      weather: "RAIN",
      notes: "Peak hour traffic"
    });
    expect(result.success).toBe(true);
  });

  it("rejects pickup area too short", () => {
    const result = reportSchema.safeParse({
      ...validReport,
      pickupArea: "A"
    });
    expect(result.success).toBe(false);
  });

  it("rejects pickup area too long", () => {
    const result = reportSchema.safeParse({
      ...validReport,
      pickupArea: "A".repeat(81)
    });
    expect(result.success).toBe(false);
  });

  it("rejects fare too low", () => {
    const result = reportSchema.safeParse({
      ...validReport,
      farePaid: 4
    });
    expect(result.success).toBe(false);
  });

  it("rejects fare too high", () => {
    const result = reportSchema.safeParse({
      ...validReport,
      farePaid: 2001
    });
    expect(result.success).toBe(false);
  });

  it("rejects notes too long", () => {
    const result = reportSchema.safeParse({
      ...validReport,
      notes: "A".repeat(201)
    });
    expect(result.success).toBe(false);
  });

  it("accepts all negotiation levels", () => {
    for (const negotiation of ["EASY", "MEDIUM", "HARD"]) {
      const result = reportSchema.safeParse({ ...validReport, negotiation });
      expect(result.success).toBe(true);
    }
  });
});
