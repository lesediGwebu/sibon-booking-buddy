# Booking System - Complete Guide

## Overview

This booking system has been updated to support a complete admin-managed workflow for bungalow bookings with seasonal pricing, once-per-year booking limits, and payment tracking.

---

## 🎯 Key Features

### 1. **User-Facing Features**

#### Booking Form Updates:
- **Removed**: Number of Guests field (bungalow capacity is fixed)
- **Updated**: Separate "Arrival Date" and "Departure Date" fields (instead of "Selected Dates")
- **Added**: 
  - Bungalow Number input
  - User Status dropdown (Owner / Registered User)
- **Kept**: Notes (Optional) field for special requests

#### Booking Rules:
- ✅ Users can only book **once per year**
- ✅ 1-year cooldown period starts **after the stay is completed** (not when booked)
- ✅ Cannot make new booking request if there's an active pending/approved booking
- ✅ Validation prevents duplicate bookings

---

### 2. **Calendar System**

#### Color Coding:
- **Grey** 🩶 - Unavailable (blocked dates)
- **Pink** 🩷 - Peak Season (available)
- **Orange** 🧡 - Off-Peak Season (available)

The calendar now displays a legend showing what each color means.

---

### 3. **Admin Booking Workflow**

The booking process now follows a structured workflow:

```
Step 1: REQUEST → User submits booking request
    ↓
Step 2: APPROVE → Admin reviews and approves
    ↓
Step 3: PAYMENT REQUEST → Admin sends EFT payment request
    ↓
Step 4: PAYMENT RECEIVED → Admin marks payment as received
    ↓
Step 5: CONFIRM → Admin confirms booking (dates now blocked on calendar)
    ↓
Step 6: COMPLETE STAY → After checkout, admin marks stay as completed (starts 1-year cooldown)
```

#### Booking Status Types:
| Status | Color | Meaning | Next Action |
|--------|-------|---------|-------------|
| Pending | Yellow | New request | Approve or Reject |
| Approved | Blue | Admin approved | Request Payment |
| Payment Requested | Yellow | EFT request sent | Mark Payment Received |
| Payment Received | Purple | Payment confirmed | Confirm Booking |
| Confirmed | Green | Fully confirmed | Dates are blocked, wait for checkout |
| Rejected | Red | Request denied | None |

---

## 🛠️ Technical Implementation

### Database Schema Updates

#### `bookings` Table:
```typescript
{
  // New fields
  bungalowNumber: string,              // User's bungalow number
  userType: "owner" | "registered",    // User status
  
  // Updated fields
  guests: optional<number>,            // Now optional
  status: "pending" | "approved" | "rejected" | 
          "payment_requested" | "payment_received" | "confirmed",
  
  // Timestamp tracking
  stayCompletedAt: optional<number>,   // When stay ended (triggers cooldown)
  paymentRequestedAt: optional<number>,
  paymentReceivedAt: optional<number>,
  confirmedAt: optional<number>
}
```

#### `availability` Table:
```typescript
{
  date: string,                         // YYYY-MM-DD
  available: number,
  blocked: boolean,
  seasonType: optional<"peak" | "offpeak">  // New season pricing
}
```

---

## 📝 Admin Usage Guide

### Setting Up Seasons

1. **Navigate to Admin Dashboard**
2. **Use the calendar management section**
3. **Click on date ranges to set season type**
4. Seasons can be set individually or in bulk

### Processing a Booking Request

#### Step 1: Review Request
- Check the "Pending Requests" section
- Verify bungalow number and dates
- Check if user's 1-year cooldown has expired (system validates automatically)

#### Step 2: Approve or Reject
- Click ✅ **Approve** button to proceed
- Click ❌ **Reject** button to deny

#### Step 3: Request Payment
- After approval, click 📤 **Send** (Request Payment)
- Send EFT details to user via email/phone
- Status changes to "Payment Requested"

#### Step 4: Confirm Payment Receipt
- Once payment received in bank, click 💰 **Dollar** icon
- Status changes to "Payment Received"

#### Step 5: Confirm Booking
- Click ✅ **Check** icon to finalize
- **Important**: Only at this step are dates blocked on the public calendar
- Status changes to "Confirmed"

#### Step 6: After Guest Checkout
- Once guest has checked out, click ✅ **Complete Stay**
- This starts the 1-year cooldown period
- User can book again 365 days after this date

### Managing Calendar Availability

#### Block Specific Dates:
1. Click on a date in the admin calendar
2. Set capacity to `0`
3. Click "Block Date" or "Save Changes"

#### Set Seasonal Pricing:
1. Use the `setSeasonForDateRange` mutation (via Convex dashboard)
2. Parameters:
   - `startDate`: "2025-12-20"
   - `endDate`: "2026-01-10"
   - `seasonType`: "peak" or "offpeak"

---

## 🔍 Business Rules Enforced

### Once-Per-Year Rule:
```
✅ Calculation based on stayCompletedAt timestamp
✅ User can book again 365 days after checkout
❌ Cannot book if less than 365 days since last completed stay
```

### Validation Checks:
1. **Check for active booking**: User cannot have pending/approved/confirmed booking
2. **Check cooldown period**: Must be 365+ days since last `stayCompletedAt`
3. **Check bungalow availability**: Dates must be available

### Error Messages:
- `"You already have an active booking request. Please wait for it to be processed or contact an admin."`
- `"You can only book once per year. Your last stay was completed X days ago. Please wait Y more days."`

---

## 🎨 UI/UX Updates

### Booking Form Changes:
```
Before:
- Selected Dates: [Nov 2 - Nov 5]
- Number of Guests: [2]

After:
- Arrival Date: [Nov 2, 2025]
- Departure Date: [Nov 5, 2025]
- Bungalow Number: [e.g., B12]
- Status: [Owner ▼]
```

### Calendar Legend:
```
🩶 Unavailable
🩷 Peak Season
🧡 Off-Peak Season
```

---

## 🔄 Migration Notes

### For Existing Bookings:
- Old bookings with `status: "approved"` should be manually reviewed
- Consider updating them to appropriate new status
- Set `stayCompletedAt` for past bookings to enable cooldown tracking

### For Existing Users:
- Bungalow numbers must be collected on next booking
- User type defaults to "Owner"

---

## 🚀 Deployment Checklist

- [ ] Deploy updated Convex schema
- [ ] Test booking validation logic
- [ ] Verify calendar color coding displays correctly
- [ ] Test complete admin workflow (all 6 steps)
- [ ] Set initial season types for upcoming dates
- [ ] Update any existing bookings with new fields
- [ ] Train admins on new workflow

---

## 📞 Support & Troubleshooting

### Common Issues:

**Q: User can't book even though it's been a year**  
A: Check if their previous stay has `stayCompletedAt` set. Admin must mark stay as completed.

**Q: Dates aren't blocked after payment**  
A: Dates only block when status is "Confirmed" (not "Payment Received")

**Q: Calendar not showing seasons**  
A: Use `setSeasonForDateRange` mutation to set season types for date ranges

**Q: How to cancel a confirmed booking?**  
A: Change status back to "Rejected" or delete the booking record

---

## 🔐 Admin Functions Reference

### Convex Functions:

#### Bookings:
- `bookings.createBooking` - Create new booking request
- `bookings.updateStatus` - Change booking status
- `bookings.completeStay` - Mark stay completed (starts cooldown)
- `bookings.list` - Get all bookings

#### Availability:
- `availability.setDateAvailability` - Set capacity for specific date
- `availability.setSeasonForDateRange` - Bulk set season type
- `availability.getMonthAvailability` - Get availability for month

---

## 📊 Status Badge Colors Reference

```css
Pending:           Yellow background, dark text
Approved:          Blue background, dark text  
Payment Requested: Yellow background, dark text
Payment Received:  Purple background, dark text
Confirmed:         Green background, dark text
Rejected:          Red background, dark text
```

---

**Version**: 2.0  
**Last Updated**: October 2025  
**System**: Sibon Booking Buddy
