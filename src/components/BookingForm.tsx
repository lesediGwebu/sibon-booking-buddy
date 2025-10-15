import { useState } from "react";
import { Calendar, Users, FileText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const BookingForm = () => {
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Booking request submitted!", {
      description: "An admin will review your request shortly.",
    });
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-md w-full flex flex-col">
      <h2 className="text-xl font-semibold mb-6">Book Ingwelala</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label 
            htmlFor="dates" 
            className="flex items-center text-sm font-medium text-foreground/70 mb-1"
          >
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            Selected dates
          </label>
          <Input
            id="dates"
            type="text"
            value="Nov 2, 2025 - Nov 5, 2025"
            readOnly
            className="bg-secondary border-transparent cursor-pointer"
          />
        </div>

        <div>
          <label 
            htmlFor="guests" 
            className="flex items-center text-sm font-medium text-foreground/70 mb-1"
          >
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            Guests (max 16)
          </label>
          <Input
            id="guests"
            type="number"
            min="1"
            max="16"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            className="bg-background"
          />
        </div>

        <div>
          <label 
            htmlFor="notes" 
            className="flex items-center text-sm font-medium text-foreground/70 mb-1"
          >
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
          className="w-full bg-hero-brown hover:bg-hero-brown/90 text-white font-bold py-6 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Request Booking
        </Button>

        <div className="flex items-start bg-available/30 p-4 rounded-lg">
          <Shield className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
          <div>
            <p className="font-semibold text-primary">Heads up!</p>
            <p className="text-sm text-available-foreground">
              Booking requests go to admins for approval.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
