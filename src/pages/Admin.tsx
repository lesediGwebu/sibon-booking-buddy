import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, Users, CheckCircle, XCircle, Edit, Trash2, Search, ChevronLeft, ChevronRight, Lock, DollarSign, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Doc<"bookings"> | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 10)); // November 2025
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editCapacity, setEditCapacity] = useState<number>(16);
  const [maxCapacityLocal, setMaxCapacityLocal] = useState<number>(16);

  // Queries
  const settings = useQuery(api.availability.getSettings, {});
  const bookings = useQuery(api.bookings.list, {});
  const monthAvail = useQuery(api.availability.getMonthAvailability, {
    year: currentMonth.getFullYear(),
    month: currentMonth.getMonth() + 1,
  });

  // Mutations
  const approve = useMutation(api.bookings.updateStatus);
  const updateBooking = useMutation(api.bookings.updateBooking);
  const removeBooking = useMutation(api.bookings.remove);
  const completeStay = useMutation(api.bookings.completeStay);
  const setMaxCapacity = useMutation(api.availability.setMaxCapacity);
  const setDateAvailability = useMutation(api.availability.setDateAvailability);

  const [adminKey, setAdminKeyLocal] = useState<string | null>(localStorage.getItem("adminKey"));

  const isConfigured = useQuery(api.admin.isConfigured, {});
  const setAdminKeyMutation = useMutation(api.admin.setAdminKey);

  const maxCapacity = settings?.maxCapacity ?? 16;

  // Sync local max capacity display
  if (maxCapacityLocal !== maxCapacity) {
    // keep input in sync without causing render loops by checking inequality
    setTimeout(() => setMaxCapacityLocal(maxCapacity), 0);
  }

  const availability = useMemo(() => monthAvail ?? {}, [monthAvail]);

  const filteredBookings = (bookings ?? []).filter((booking) => {
    const name = booking.userName ?? "";
    const email = booking.userEmail ?? "";
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleApprove = async (id: Id<"bookings">) => {
    await approve({ id, status: "approved", adminKey: adminKey ?? undefined });
    toast.success("Booking approved successfully");
  };

  const handleReject = async (id: Id<"bookings">) => {
    await approve({ id, status: "rejected", adminKey: adminKey ?? undefined });
    toast.success("Booking rejected");
  };

  const handleRequestPayment = async (id: Id<"bookings">) => {
    await approve({ id, status: "payment_requested", adminKey: adminKey ?? undefined });
    toast.success("Payment request sent");
  };

  const handlePaymentReceived = async (id: Id<"bookings">) => {
    await approve({ id, status: "payment_received", adminKey: adminKey ?? undefined });
    toast.success("Payment received marked");
  };

  const handleConfirm = async (id: Id<"bookings">) => {
    await approve({ id, status: "confirmed", adminKey: adminKey ?? undefined });
    toast.success("Booking confirmed! Dates are now blocked.");
  };

  const handleCompleteStay = async (id: Id<"bookings">) => {
    await completeStay({ id, adminKey: adminKey ?? undefined });
    toast.success("Stay marked as completed. 1-year cooldown started.");
  };

  const handleDelete = async (id: Id<"bookings">) => {
    await removeBooking({ id, adminKey: adminKey ?? undefined });
    toast.success("Booking deleted");
  };

const handleEditBooking = (booking: Doc<"bookings">) => {
    setSelectedBooking(booking);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (selectedBooking) {
      await updateBooking({
        id: selectedBooking._id,
        checkIn: selectedBooking.checkIn,
        checkOut: selectedBooking.checkOut,
        guests: selectedBooking.guests,
        notes: selectedBooking.notes,
        adminKey: adminKey ?? undefined,
      });
      toast.success("Booking updated successfully");
      setIsEditDialogOpen(false);
    }
  };

  const getStatusBadge = (status: "pending" | "approved" | "rejected" | "payment_requested" | "payment_received" | "confirmed") => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case "payment_requested":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <DollarSign className="w-3 h-3 mr-1" />
            Payment Requested
          </span>
        );
      case "payment_received":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Check className="w-3 h-3 mr-1" />
            Payment Received
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/30 text-accent-foreground">
            <CalendarIcon className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  const pendingCount = (bookings ?? []).filter((b) => b.status === "pending").length;
  const approvedCount = (bookings ?? []).filter((b) => b.status === "approved").length;

  // Calendar functions
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ date: string; day: number; isCurrentMonth: boolean }> = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: "",
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push({
        date: dateStr,
        day,
        isCurrentMonth: true,
      });
    }

    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    const dateAvail = availability[dateStr] || { available: maxCapacity, blocked: false };
    setEditCapacity(dateAvail.available);
    setIsCalendarDialogOpen(true);
  };

  const handleSaveAvailability = async () => {
    if (selectedDate) {
      await setDateAvailability({ date: selectedDate, available: editCapacity, adminKey: adminKey ?? undefined });
      toast.success("Availability updated");
      setIsCalendarDialogOpen(false);
    }
  };

  const handleBlockDate = async () => {
    if (selectedDate) {
      await setDateAvailability({ date: selectedDate, available: 0, adminKey: adminKey ?? undefined });
      toast.success("Date blocked");
      setIsCalendarDialogOpen(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-hero-brown text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <img src="/ingwelala-logo.jpeg" alt="Ingwelala Logo" className="h-14 w-14 rounded-lg bg-white p-1 object-contain" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm opacity-90 mt-1">Manage bookings and availability for Ingwelala</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin key prompt */}
        <div className="mb-4 bg-card p-4 rounded-md border">
          {isConfigured ? (
            <div className="flex gap-2 items-center">
              <input
                type="password"
                placeholder="Enter admin key"
                className="border rounded px-3 py-2 w-64"
                onChange={(e) => setAdminKeyLocal(e.target.value)}
              />
              <Button
                onClick={() => {
                  if (adminKey) localStorage.setItem("adminKey", adminKey);
                  toast.success("Admin key set locally");
                }}
              >
                Save
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 items-center">
              <input
                type="password"
                placeholder="Set new admin key"
                className="border rounded px-3 py-2 w-64"
                onChange={(e) => setAdminKeyLocal(e.target.value)}
              />
              <Button
                onClick={async () => {
                  if (!adminKey) return;
                  await setAdminKeyMutation({ adminKey });
                  toast.success("Admin key configured");
                }}
              >
                Configure
              </Button>
            </div>
          )}
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg shadow-md border-l-4 border-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-3xl font-bold mt-1">{pendingCount}</p>
              </div>
              <CalendarIcon className="h-10 w-10 text-accent" />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-md border-l-4 border-available-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved Bookings</p>
                <p className="text-3xl font-bold mt-1">{approvedCount}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-available-foreground" />
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-md border-l-4 border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Max Capacity</p>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={maxCapacityLocal}
                    onChange={(e) => setMaxCapacityLocal(parseInt(e.target.value) || 0)}
                    onBlur={(e) => setMaxCapacity({ maxCapacity: parseInt((e.target as HTMLInputElement).value) || 0, adminKey: adminKey ?? undefined })}
                    className="w-20 h-10 text-xl font-bold"
                    min="1"
                    max="50"
                  />
                  <span className="text-sm text-muted-foreground">guests</span>
                </div>
              </div>
              <Users className="h-10 w-10 text-primary" />
            </div>
          </div>
        </div>

        {/* Calendar Availability Management */}
        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Calendar Availability</h2>
              <p className="text-sm text-muted-foreground mt-1">Click on any date to adjust availability</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="font-semibold text-lg px-4">
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handleNextMonth}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground mb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {generateCalendarDays().map((day, index) => {
              if (!day.isCurrentMonth) {
                return (
                  <div key={index} className="p-2 text-center text-muted-foreground">
                    {day.day}
                  </div>
                );
              }

              const dateAvail = availability[day.date];
              const isBlocked = dateAvail?.blocked || dateAvail?.available === 0;
              const availCount = dateAvail?.available ?? maxCapacity;

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day.date)}
                  className={`p-3 text-center rounded-lg transition-all hover:ring-2 hover:ring-primary ${
                    isBlocked
                      ? "bg-unavailable cursor-pointer"
                      : availCount < maxCapacity
                      ? "bg-accent/30 cursor-pointer"
                      : "bg-available/30 hover:bg-available/50 cursor-pointer"
                  }`}
                >
                  <div className="font-semibold">{day.day}</div>
                  {isBlocked ? (
                    <div className="text-xs mt-1 text-destructive flex items-center justify-center">
                      <Lock className="h-3 w-3" />
                    </div>
                  ) : (
                    <div className="text-xs mt-1 text-muted-foreground">
                      {availCount}/{maxCapacity}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-available/30" />
                <span>Full availability</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-accent/30" />
                <span>Partial availability</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-unavailable" />
                <span>Blocked/Unavailable</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Management */}
        <div className="bg-card rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-semibold">Booking Requests</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest Name</TableHead>
                  <TableHead>Bungalow</TableHead>
                  <TableHead>User Type</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
filteredBookings.map((booking: Doc<"bookings">) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">{booking.userName ?? "-"}</TableCell>
                      <TableCell>{booking.bungalowNumber ?? "-"}</TableCell>
                      <TableCell className="capitalize">{booking.userType ?? "-"}</TableCell>
                      <TableCell>{new Date(booking.checkIn).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(booking.checkOut).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {booking.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleApprove(booking._id)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReject(booking._id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {booking.status === "approved" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRequestPayment(booking._id)}
                              className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                              title="Request Payment"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          {booking.status === "payment_requested" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handlePaymentReceived(booking._id)}
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                              title="Mark Payment Received"
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          )}
                          {booking.status === "payment_received" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleConfirm(booking._id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Confirm Booking"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {booking.status === "confirmed" && !booking.stayCompletedAt && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCompleteStay(booking._id)}
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                              title="Mark Stay Completed"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleEditBooking(booking)} className="hover:bg-secondary" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(booking._id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* Calendar Edit Dialog */}
      <Dialog open={isCalendarDialogOpen} onOpenChange={setIsCalendarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Date Availability</DialogTitle>
            <DialogDescription>
              Adjust the availability for {selectedDate && new Date(selectedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date-capacity">Available Capacity</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="date-capacity"
                  type="number"
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(parseInt(e.target.value) || 0)}
                  min="0"
                  max={maxCapacity}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">/ {maxCapacity} max</span>
              </div>
              <p className="text-xs text-muted-foreground">Set to 0 to block this date completely</p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="destructive" onClick={handleBlockDate} className="w-full sm:w-auto">
              <Lock className="h-4 w-4 mr-2" />
              Block Date
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setIsCalendarDialogOpen(false)} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button onClick={handleSaveAvailability} className="bg-hero-brown hover:bg-hero-brown/90 flex-1 sm:flex-none">
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>Make changes to the booking details below.</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-checkin">Check-in</Label>
                  <Input
                    id="edit-checkin"
                    type="date"
                    value={selectedBooking.checkIn}
                    onChange={(e) => setSelectedBooking({ ...selectedBooking, checkIn: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-checkout">Check-out</Label>
                  <Input
                    id="edit-checkout"
                    type="date"
                    value={selectedBooking.checkOut}
                    onChange={(e) => setSelectedBooking({ ...selectedBooking, checkOut: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-guests">Number of Guests</Label>
                <Input
                  id="edit-guests"
                  type="number"
                  value={selectedBooking.guests}
                  onChange={(e) => setSelectedBooking({ ...selectedBooking, guests: parseInt(e.target.value) })}
                  min="1"
                  max={maxCapacity}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-hero-brown hover:bg-hero-brown/90">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
