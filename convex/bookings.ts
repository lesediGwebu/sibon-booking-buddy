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
    bungalowNumber: v.string(),
    userType: v.union(v.literal("owner"), v.literal("registered")),
    notes: v.optional(v.string()),
    userEmail: v.optional(v.string()),
    userName: v.optional(v.string()),
  },
  handler: async (ctx, { checkIn, checkOut, bungalowNumber, userType, notes, userEmail, userName }) => {
    // Validate: Check if user already has a booking within 1 year cooldown
    const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
    
    const existingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_bungalow", (q) => q.eq("bungalowNumber", bungalowNumber))
      .collect();
    
    // Check if user has a completed stay within the past year
    const recentCompletedStay = existingBookings.find((booking) => {
      // Only check confirmed bookings with a completed stay date
      if (booking.status === "confirmed" && booking.stayCompletedAt) {
        return booking.stayCompletedAt > oneYearAgo;
      }
      return false;
    });
    
    if (recentCompletedStay) {
      const daysRemaining = Math.ceil((365 * 24 * 60 * 60 * 1000 - (Date.now() - recentCompletedStay.stayCompletedAt!)) / (24 * 60 * 60 * 1000));
      throw new Error(`You can only book once per year. Your last stay was completed ${Math.floor((Date.now() - recentCompletedStay.stayCompletedAt!) / (24 * 60 * 60 * 1000))} days ago. Please wait ${daysRemaining} more days.`);
    }
    
    // Check if user has an active/pending booking
    const activeBooking = existingBookings.find((booking) => 
      ["pending", "approved", "payment_requested", "payment_received", "confirmed"].includes(booking.status)
    );
    
    if (activeBooking) {
      throw new Error("You already have an active booking request. Please wait for it to be processed or contact an admin.");
    }

    const createdAt = Date.now();
    const doc = await ctx.db.insert("bookings", {
      userId: `${bungalowNumber}-${userType}`,
      userEmail,
      userName,
      bungalowNumber,
      userType,
      checkIn,
      checkOut,
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
    status: v.union(
      v.literal("pending"), 
      v.literal("approved"), 
      v.literal("rejected"),
      v.literal("payment_requested"),
      v.literal("payment_received"),
      v.literal("confirmed")
    ),
    adminKey: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, adminKey }) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .unique();
    const storedKey = settings?.value?.adminKey;
    if (storedKey && storedKey !== adminKey) throw new Error("Forbidden");
    
    const updates: any = { status };
    
    // Track timestamps for workflow stages
    if (status === "payment_requested") {
      updates.paymentRequestedAt = Date.now();
    } else if (status === "payment_received") {
      updates.paymentReceivedAt = Date.now();
    } else if (status === "confirmed") {
      updates.confirmedAt = Date.now();
    }
    
    await ctx.db.patch(id, updates);
  },
});

// New mutation: Mark stay as completed (triggers cooldown period)
export const completeStay = mutation({
  args: {
    id: v.id("bookings"),
    adminKey: v.optional(v.string()),
  },
  handler: async (ctx, { id, adminKey }) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .unique();
    const storedKey = settings?.value?.adminKey;
    if (storedKey && storedKey !== adminKey) throw new Error("Forbidden");
    
    const booking = await ctx.db.get(id);
    if (!booking) throw new Error("Booking not found");
    if (booking.status !== "confirmed") throw new Error("Can only complete confirmed bookings");
    
    await ctx.db.patch(id, { 
      stayCompletedAt: Date.now() 
    });
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
