import { useMemo, useState } from "react";
import BookingHeader from "@/components/BookingHeader";
import Calendar from "@/components/Calendar";
import BookingForm from "@/components/BookingForm";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const Index = () => {
  // Fixed month shown in the UI
  const year = 2025;
  const month = 11; // November
  const [selectedRange, setSelectedRange] = useState({ start: 2, end: 5 });

  const settings = useQuery(api.availability.getSettings, {});
  const avail = useQuery(api.availability.getMonthAvailability, { year, month });

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-stretch">
          <div className="lg:col-span-2 flex">
            <Calendar
              selectedRange={selectedRange}
              onChangeSelectedRange={setSelectedRange}
              availabilityByDay={availabilityByDay}
              maxCapacity={maxCapacity}
            />
          </div>
          <div className="flex">
            <BookingForm year={year} month={month} selectedRange={selectedRange} />
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-muted-foreground py-6 mt-8">
        © 2025 Ingwelala • Internal booking system • Capacity {maxCapacity}
      </footer>
    </div>
  );
};

export default Index;
