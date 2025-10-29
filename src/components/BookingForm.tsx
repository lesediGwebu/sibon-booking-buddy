import { useMemo, useState } from "react";
import { Calendar, Home, FileText, Shield, CheckCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type Props = {
  year: number; // e.g. 2025
  month: number; // 1-12
  selectedRange: { start: number; end: number };
};

const BookingForm = ({ year, month, selectedRange }: Props) => {
  const [notes, setNotes] = useState("");
  const [name, setName] = useState("");
  const [bungalowNumber, setBungalowNumber] = useState("");
  const [userType, setUserType] = useState<"owner" | "registered">("owner");
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const createBooking = useMutation(api.bookings.createBooking);
  const settings = useQuery(api.availability.getSettings, {});

  const { checkIn, checkOut, arrivalLabel, departureLabel } = useMemo(() => {
    const d = (day: number) => `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const ci = d(selectedRange.start);
    const co = d(selectedRange.end);
    const arrivalLabel = new Date(ci).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    const departureLabel = new Date(co).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    return { checkIn: ci, checkOut: co, arrivalLabel, departureLabel };
  }, [year, month, selectedRange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Please enter your name");
      return;
    }
    if (!bungalowNumber) {
      toast.error("Please enter your bungalow number");
      return;
    }
    setSubmitting(true);
    try {
      await createBooking({ 
        checkIn, 
        checkOut, 
        bungalowNumber,
        userType,
        notes: notes || undefined, 
        userName: name
      });
      toast.success("Booking request submitted!", {
        description: "An admin will review your request shortly.",
      });
      setNotes("");
      setSuccessOpen(true);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
  };

  const maxCapacity = settings?.maxCapacity ?? 16;

  return (
    <div className="bg-card p-6 rounded-lg shadow-md w-full flex flex-col">
      <h2 className="text-xl font-semibold mb-6">Book Ingwelala</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="arrivalDate" className="flex items-center text-sm font-medium text-foreground/70 mb-1">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            Arrival Date
          </label>
          <Input id="arrivalDate" type="text" value={arrivalLabel} readOnly className="bg-secondary border-transparent cursor-pointer" />
        </div>

        <div>
          <label htmlFor="departureDate" className="flex items-center text-sm font-medium text-foreground/70 mb-1">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            Departure Date
          </label>
          <Input id="departureDate" type="text" value={departureLabel} readOnly className="bg-secondary border-transparent cursor-pointer" />
        </div>

        <div>
          <label htmlFor="name" className="flex items-center text-sm font-medium text-foreground/70 mb-1">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            Name
          </label>
          <Input id="name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="bg-background" required />
        </div>

        <div>
          <label htmlFor="bungalowNumber" className="flex items-center text-sm font-medium text-foreground/70 mb-1">
            <Home className="h-4 w-4 mr-2 text-muted-foreground" />
            Bungalow Number
          </label>
          <Input id="bungalowNumber" type="text" placeholder="e.g., B12" value={bungalowNumber} onChange={(e) => setBungalowNumber(e.target.value)} className="bg-background" required />
        </div>

        <div>
          <label htmlFor="userType" className="flex items-center text-sm font-medium text-foreground/70 mb-1">
            <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
            Status
          </label>
          <Select value={userType} onValueChange={(value: "owner" | "registered") => setUserType(value)}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="registered">Registered User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="notes" className="flex items-center text-sm font-medium text-foreground/70 mb-1">
            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
            Note (optional)
          </label>
          <Textarea
            id="notes"
            placeholder="e.g., late arrival, special requests"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-background resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-hero-brown hover:bg-hero-brown/90 text-white font-bold py-6 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Request Booking"}
        </Button>

        <div className="flex items-start bg-available/30 p-4 rounded-lg">
          <Shield className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
          <div>
            <p className="font-semibold text-primary">Heads up!</p>
            <p className="text-sm text-available-foreground">Booking requests require admin approval and payment confirmation before dates are reserved.</p>
          </div>
        </div>
      </form>
      {/* Success Splash */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-available-foreground" />
              Booking request sent
            </DialogTitle>
            <DialogDescription>
              Thanks {name || ""}! We’ve received your request and an admin will review it shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-secondary rounded-md p-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Arrival</span><span className="font-medium">{arrivalLabel}</span></div>
            <div className="flex justify-between mt-1"><span className="text-muted-foreground">Departure</span><span className="font-medium">{departureLabel}</span></div>
            <div className="flex justify-between mt-1"><span className="text-muted-foreground">Bungalow</span><span className="font-medium">{bungalowNumber}</span></div>
            <div className="flex justify-between mt-1"><span className="text-muted-foreground">Status</span><span className="font-medium">{userType === "owner" ? "Owner" : "Registered User"}</span></div>
            {notes && (
              <div className="mt-2">
                <div className="text-muted-foreground">Note</div>
                <div className="font-medium whitespace-pre-wrap">{notes}</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setSuccessOpen(false)} className="bg-hero-brown hover:bg-hero-brown/90">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingForm;
