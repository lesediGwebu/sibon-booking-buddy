import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();
  },
});

export const createBooking = mutation({
  args: {
    checkIn: v.string(), // YYYY-MM-DD
    checkOut: v.string(),
    guests: v.number(),
    notes: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    userName: v.optional(v.string()),
  },
  handler: async (ctx, { checkIn, checkOut, guests, notes, userEmail, userName }) => {
    const createdAt = Date.now();
    const doc = await ctx.db.insert("bookings", {
      userId: "public",
      userEmail,
      userName,
      checkIn,
      checkOut,
      guests,
      status: "pending",
      notes,
      createdAt,
    });
    return doc;
  },
});

export const updateBooking = mutation({
  args: {
    id: v.id("bookings"),
    checkIn: v.optional(v.string()),
    checkOut: v.optional(v.string()),
    guests: v.optional(v.number()),
    notes: v.optional(v.string()),
    adminKey: v.optional(v.string()),
  },
  handler: async (ctx, { id, adminKey, ...updates }) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .unique();
    const storedKey = settings?.value?.adminKey;
    if (storedKey && storedKey !== adminKey) throw new Error("Forbidden");

    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Not found");
    await ctx.db.patch(id, updates);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("bookings"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    adminKey: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, adminKey }) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .unique();
    const storedKey = settings?.value?.adminKey;
    if (storedKey && storedKey !== adminKey) throw new Error("Forbidden");
    await ctx.db.patch(id, { status });
  },
});

export const remove = mutation({
  args: { id: v.id("bookings"), adminKey: v.optional(v.string()) },
  handler: async (ctx, { id, adminKey }) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .unique();
    const storedKey = settings?.value?.adminKey;
    if (storedKey && storedKey !== adminKey) throw new Error("Forbidden");
    await ctx.db.delete(id);
  },
});
