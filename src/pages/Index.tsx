import { useMemo, useState } from "react";
import BookingHeader from "@/components/BookingHeader";
import Calendar from "@/components/Calendar";
import BookingForm from "@/components/BookingForm";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 2);
  const [selectedRange, setSelectedRange] = useState({ 
    start: today.getDate(), 
    end: today.getDate() + 2,
    startDate: today,
    endDate: tomorrow
  });

  const settings = useQuery(api.availability.getSettings, {});
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const avail = useQuery(api.availability.getMonthAvailability, { 
    year: viewYear, 
    month: viewMonth 
  });

  const availabilityByDay = useMemo(() => {
    const map: Record<number, { available: number; seasonType?: "peak" | "offpeak" }> = {};
    if (avail) {
      Object.entries(avail).forEach(([date, value]) => {
        const day = Number(date.split("-")[2]);
        map[day] = { 
          available: value.available,
          seasonType: value.seasonType 
        };
      });
    }
    return map;
  }, [avail]);

  const maxCapacity = settings?.maxCapacity ?? 16;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BookingHeader />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-end mb-4">
          <Button asChild variant="outline">
            <Link to="/admin">Go to Admin</Link>
          </Button>
        </div>
        {/* Pricing Information */}
        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-pink-300 rounded-lg p-4 bg-pink-50">
              <h3 className="font-semibold text-lg text-pink-800 mb-2">Peak Season Rate</h3>
              <p className="text-sm text-muted-foreground mb-2">Weekends (Fri-Sun), school holidays & public holidays</p>
              <p className="text-3xl font-bold text-pink-900">R 8,300<span className="text-lg font-normal text-muted-foreground">/night</span></p>
            </div>
            <div className="border-2 border-orange-300 rounded-lg p-4 bg-orange-50">
              <h3 className="font-semibold text-lg text-orange-800 mb-2">Low Season Rate</h3>
              <p className="text-sm text-muted-foreground mb-2">Midweek (Mon-Thu), excluding public holidays</p>
              <p className="text-3xl font-bold text-orange-900">R 4,600<span className="text-lg font-normal text-muted-foreground">/night</span></p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border space-y-1 text-sm text-muted-foreground">
            <p>• Flat rate for up to 16 guests</p>
            <p>• Admin approval required for all bookings</p>
            <p>• Payment confirmation required before dates are reserved</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-stretch">
          <div className="lg:col-span-2 flex">
            <Calendar
              selectedRange={selectedRange}
              onChangeSelectedRange={setSelectedRange}
              availabilityByDay={availabilityByDay}
              maxCapacity={maxCapacity}
              onMonthChange={(y, m) => { setViewYear(y); setViewMonth(m); }}
            />
          </div>
          <div className="flex">
            <BookingForm 
              year={today.getFullYear()} 
              month={today.getMonth() + 1} 
              selectedRange={selectedRange}
              onDateChange={(start, end) => {
                if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                  const s = new Date(start);
                  let e = new Date(end);
                  // normalize to midnight
                  s.setHours(0,0,0,0);
                  e.setHours(0,0,0,0);
                  if (e <= s) {
                    e = new Date(s);
                    e.setDate(s.getDate() + 1);
                  }
                  setSelectedRange({
                    start: s.getDate(),
                    end: e.getDate(),
                    startDate: s,
                    endDate: e
                  });
                }
              }}
            />
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-muted-foreground py-6 mt-8">
        © 2025 Sibon • Sleeps up to 16 guests • Peak: R8,300/night | Low: R4,600/night
      </footer>
    </div>
  );
};

export default Index;
