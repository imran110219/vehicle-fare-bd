import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6)
});

export const estimateSchema = z.object({
  city: z.enum(["DHAKA", "CHATTOGRAM", "SYLHET", "KHULNA", "OTHER"]),
  vehicleType: z.enum(["RICKSHAW", "CNG", "AUTO_RICKSHAW", "BIKE", "CAR", "MICROBUS", "BUS", "OTHER"]),
  distanceKm: z.number().positive().max(50),
  timeOfDay: z.enum(["MORNING", "AFTERNOON", "EVENING", "NIGHT"]),
  weather: z.enum(["CLEAR", "RAIN"]).optional(),
  passengerCount: z.number().int().min(1).max(3),
  luggage: z.boolean(),
  traffic: z.boolean()
});

export const reportSchema = z.object({
  city: z.enum(["DHAKA", "CHATTOGRAM", "SYLHET", "KHULNA", "OTHER"]),
  vehicleType: z.enum(["RICKSHAW", "CNG", "AUTO_RICKSHAW", "BIKE", "CAR", "MICROBUS", "BUS", "OTHER"]),
  pickupArea: z.string().min(2).max(80),
  dropArea: z.string().min(2).max(80),
  distanceKm: z.number().positive().max(50),
  farePaid: z.number().int().min(5).max(2000),
  timeOfDay: z.enum(["MORNING", "AFTERNOON", "EVENING", "NIGHT"]),
  weather: z.enum(["CLEAR", "RAIN"]).optional(),
  passengerCount: z.number().int().min(1).max(3),
  luggage: z.boolean(),
  traffic: z.boolean(),
  negotiation: z.enum(["EASY", "MEDIUM", "HARD"]),
  notes: z.string().max(200).optional()
});
