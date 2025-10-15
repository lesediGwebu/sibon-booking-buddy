import { useState } from "react";
import { Calendar, Users, CheckCircle, XCircle, Edit, Trash2, Search, ChevronLeft, ChevronRight, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Booking {
  id: string;
  guestName: string;
  email: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: "pending" | "approved" | "rejected";
  notes?: string;
}

interface DateAvailability {
  date: string;
  available: number;
  blocked: boolean;
}

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCalendarDialogOpen, setIsCalendarDialogOpen] = useState(false);
  const [maxCapacity, setMaxCapacity] = useState(16);
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 10)); // November 2025
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editCapacity, setEditCapacity] = useState<number>(16);

  // Calendar availability data
  const [availability, setAvailability] = useState<Record<string, DateAvailability>>({
    "2025-11-01": { date: "2025-11-01", available: 0, blocked: true },
    "2025-11-02": { date: "2025-11-02", available: 16, blocked: false },
    "2025-11-03": { date: "2025-11-03", available: 16, blocked: false },
    "2025-11-04": { date: "2025-11-04", available: 8, blocked: false },
    "2025-11-05": { date: "2025-11-05", available: 8, blocked: false },
  });

  // Mock booking data
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "1",
      guestName: "John Doe",
      email: "john@example.com",
      checkIn: "2025-11-02",
      checkOut: "2025-11-05",
      guests: 8,
      status: "pending",
      notes: "Late arrival expected",
    },
    {
      id: "2",
      guestName: "Jane Smith",
      email: "jane@example.com",
      checkIn: "2025-11-10",
      checkOut: "2025-11-14",
      guests: 12,
      status: "approved",
    },
    {
      id: "3",
      guestName: "Bob Wilson",
      email: "bob@example.com",
      checkIn: "2025-11-15",
      checkOut: "2025-11-18",
      guests: 6,
      status: "pending",
      notes: "Special dietary requirements",
    },
  ]);

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = (id: string) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, status: "approved" as const } : booking
      )
    );
    toast.success("Booking approved successfully");
  };

  const handleReject = (id: string) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, status: "rejected" as const } : booking
      )
    );
    toast.success("Booking rejected");
  };

  const handleDelete = (id: string) => {
    setBookings((prev) => prev.filter((booking) => booking.id !== id));
    toast.success("Booking deleted");
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedBooking) {
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBooking.id ? selectedBooking : booking
        )
      );
      toast.success("Booking updated successfully");
      setIsEditDialogOpen(false);
    }
  };

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-available text-available-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
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
            <Calendar className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const approvedCount = bookings.filter((b) => b.status === "approved").length;

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
    const dateAvail = availability[dateStr] || { date: dateStr, available: maxCapacity, blocked: false };
    setEditCapacity(dateAvail.available);
    setIsCalendarDialogOpen(true);
  };

  const handleSaveAvailability = () => {
    if (selectedDate) {
      setAvailability((prev) => ({
        ...prev,
        [selectedDate]: {
          date: selectedDate,
          available: editCapacity,
          blocked: editCapacity === 0,
        },
      }));
      toast.success("Availability updated");
      setIsCalendarDialogOpen(false);
    }
  };

  const handleBlockDate = () => {
    if (selectedDate) {
      setAvailability((prev) => ({
        ...prev,
        [selectedDate]: {
          date: selectedDate,
          available: 0,
          blocked: true,
        },
      }));
      toast.success("Date blocked");
      setIsCalendarDialogOpen(false);
    }
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-hero-brown text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm opacity-90 mt-1">Manage bookings and availability for Ingwelala</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg shadow-md border-l-4 border-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-3xl font-bold mt-1">{pendingCount}</p>
              </div>
              <Calendar className="h-10 w-10 text-accent" />
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
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(parseInt(e.target.value))}
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
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={handlePreviousMonth}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="font-semibold text-lg px-4">
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={handleNextMonth}
              >
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
            {calendarDays.map((day, index) => {
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
                  <TableHead>Email</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Guests</TableHead>
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
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.guestName}</TableCell>
                      <TableCell>{booking.email}</TableCell>
                      <TableCell>{new Date(booking.checkIn).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(booking.checkOut).toLocaleDateString()}</TableCell>
                      <TableCell>{booking.guests}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {booking.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleApprove(booking.id)}
                                className="text-available-foreground hover:text-available-foreground hover:bg-available/20"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleReject(booking.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditBooking(booking)}
                            className="hover:bg-secondary"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(booking.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
            <Button
              variant="destructive"
              onClick={handleBlockDate}
              className="w-full sm:w-auto"
            >
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
              <div className="space-y-2">
                <Label htmlFor="edit-name">Guest Name</Label>
                <Input
                  id="edit-name"
                  value={selectedBooking.guestName}
                  onChange={(e) =>
                    setSelectedBooking({ ...selectedBooking, guestName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedBooking.email}
                  onChange={(e) =>
                    setSelectedBooking({ ...selectedBooking, email: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-checkin">Check-in</Label>
                  <Input
                    id="edit-checkin"
                    type="date"
                    value={selectedBooking.checkIn}
                    onChange={(e) =>
                      setSelectedBooking({ ...selectedBooking, checkIn: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-checkout">Check-out</Label>
                  <Input
                    id="edit-checkout"
                    type="date"
                    value={selectedBooking.checkOut}
                    onChange={(e) =>
                      setSelectedBooking({ ...selectedBooking, checkOut: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-guests">Number of Guests</Label>
                <Input
                  id="edit-guests"
                  type="number"
                  value={selectedBooking.guests}
                  onChange={(e) =>
                    setSelectedBooking({ ...selectedBooking, guests: parseInt(e.target.value) })
                  }
                  min="1"
                  max={maxCapacity}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={selectedBooking.status}
                  onValueChange={(value: Booking["status"]) =>
                    setSelectedBooking({ ...selectedBooking, status: value })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
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
