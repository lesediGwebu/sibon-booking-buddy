import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const doc = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .unique();
    return doc?.value ?? { maxCapacity: 16 };
  },
});

export const setMaxCapacity = mutation({
  args: { maxCapacity: v.number(), adminKey: v.optional(v.string()) },
  handler: async (ctx, { maxCapacity, adminKey }) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .unique();
    const storedKey = existing?.value?.adminKey;
    if (storedKey && storedKey !== adminKey) throw new Error("Forbidden");
    if (existing) {
      await ctx.db.patch(existing._id, { value: { ...(existing.value ?? {}), maxCapacity } });
    } else {
      await ctx.db.insert("settings", { key: "global", value: { maxCapacity } });
    }
  },
});

export const getMonthAvailability = query({
  args: { year: v.number(), month: v.number() }, // month: 1-12
  handler: async (ctx, { year, month }) => {
    // Pull all dates for the month
    const results = await ctx.db.query("availability").collect();
    const prefix = `${year}-${String(month).padStart(2, "0")}-`;
    const byDate: Record<string, { available: number; blocked: boolean }> = {};
    for (const r of results) {
      if (r.date.startsWith(prefix)) byDate[r.date] = { available: r.available, blocked: r.blocked };
    }
    return byDate;
  },
});

export const setDateAvailability = mutation({
  args: { date: v.string(), available: v.number(), adminKey: v.optional(v.string()) },
  handler: async (ctx, { date, available, adminKey }) => {
    const blocked = available === 0;
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .unique();
    const storedKey = settings?.value?.adminKey;
    if (storedKey && storedKey !== adminKey) throw new Error("Forbidden");

    const existing = await ctx.db
      .query("availability")
      .withIndex("by_date", (q) => q.eq("date", date))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { available, blocked });
    } else {
      await ctx.db.insert("availability", { date, available, blocked });
    }
  },
});
