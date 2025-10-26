import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  bookings: defineTable({
    userId: v.string(),
    userEmail: v.optional(v.string()),
    userName: v.optional(v.string()),
    checkIn: v.string(), // YYYY-MM-DD
    checkOut: v.string(), // YYYY-MM-DD
    guests: v.number(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"]) // list my bookings
    .index("by_status", ["status", "createdAt"]) // admin views
    .index("by_createdAt", ["createdAt"]),

  availability: defineTable({
    date: v.string(), // YYYY-MM-DD
    available: v.number(),
    blocked: v.boolean(),
  }).index("by_date", ["date"]),

  settings: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),

  admins: defineTable({
    userId: v.string(),
  }).index("by_userId", ["userId"]),
});
