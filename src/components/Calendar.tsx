import { useState } from "react";
import { ChevronLeft, ChevronRight, Moon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DateInfo {
  date: number;
  available: number;
  isCurrentMonth: boolean;
}

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState("November 2025");
  const [selectedRange, setSelectedRange] = useState({ start: 2, end: 5 });

  // Generate calendar days for November 2025
  const generateCalendarDays = (): DateInfo[] => {
    const days: DateInfo[] = [];
    
    // Previous month days (Oct 27-31)
    for (let i = 27; i <= 31; i++) {
      days.push({ date: i, available: 16, isCurrentMonth: false });
    }
    
    // Current month days (Nov 1-30)
    days.push({ date: 1, available: 0, isCurrentMonth: true }); // Unavailable
    for (let i = 2; i <= 5; i++) {
      days.push({ date: i, available: i <= 3 ? 16 : 8, isCurrentMonth: true });
    }
    for (let i = 6; i <= 30; i++) {
      days.push({ date: i, available: 16, isCurrentMonth: true });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  const isSelected = (date: number) => {
    return date >= selectedRange.start && date <= selectedRange.end;
  };

  const isRangeStart = (date: number) => date === selectedRange.start;
  const isRangeEnd = (date: number) => date === selectedRange.end;

  const getDayClasses = (day: DateInfo) => {
    if (!day.isCurrentMonth) {
      return "text-muted-foreground py-2";
    }

    if (day.available === 0) {
      return "bg-unavailable rounded-lg p-2 text-center text-muted-foreground cursor-not-allowed";
    }

    const isInRange = isSelected(day.date);
    const isStart = isRangeStart(day.date);
    const isEnd = isRangeEnd(day.date);

    let classes = "p-2 text-center cursor-pointer transition-colors ";

    if (isInRange) {
      classes += "bg-available ";
      if (isStart) classes += "rounded-l-lg ring-2 ring-selected-border ";
      if (isEnd) classes += "rounded-r-lg ring-2 ring-selected-border ";
      if (!isStart && !isEnd) classes += "";
    } else {
      classes += "rounded-lg hover:bg-available/50 ";
    }

    return classes;
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Availability</h2>
          <p className="text-sm text-muted-foreground">Select a start and end date</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => console.log("Previous month")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-lg px-2">{currentMonth}</span>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => console.log("Next month")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground mb-2">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => (
          <div key={index} className={getDayClasses(day)}>
            <div className={`font-semibold ${isSelected(day.date) && day.isCurrentMonth ? 'text-available-foreground' : ''}`}>
              {day.date}
            </div>
            {day.isCurrentMonth && day.available > 0 && (
              <div className={`text-xs mt-1 ${isSelected(day.date) ? 'text-available-foreground' : 'text-muted-foreground'}`}>
                {day.available} left
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-border pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Moon className="h-5 w-5 text-accent" />
            <span className="font-medium">3 nights</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-accent" />
            <span className="font-medium">8 guests capacity</span>
          </div>
        </div>
        <Button variant="link" className="font-semibold text-primary p-0 h-auto">
          View Availability Summary
        </Button>
      </div>
    </div>
  );
};

export default Calendar;
