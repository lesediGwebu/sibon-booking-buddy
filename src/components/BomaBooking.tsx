import { Flame } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useMemo } from "react";
import { format } from "date-fns";

type Props = {
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
  checkIn: Date;
  checkOut: Date;
  availability?: Record<string, { bomaBlocked?: boolean }>;
};

const BomaBooking = ({ selectedDates, onDatesChange, checkIn, checkOut, availability }: Props) => {
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const current = new Date(checkIn);
    // Include check-in day, exclude check-out day (nights stayed)
    while (current < checkOut) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [checkIn, checkOut]);

  const toggleDate = (dateStr: string) => {
    if (selectedDates.includes(dateStr)) {
      onDatesChange(selectedDates.filter((d) => d !== dateStr));
    } else {
      onDatesChange([...selectedDates, dateStr].sort());
    }
  };

  const totalCost = selectedDates.length * 350;

  return (
    <div className="bg-card rounded-lg shadow-md p-6 border border-border/50">
      <div className="flex items-start space-x-4">
        <div className="bg-orange-100 p-3 rounded-full">
          <Flame className="h-6 w-6 text-orange-600" />
        </div>
        <div className="flex-grow grid gap-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label
              className="text-xl font-semibold leading-none flex items-center"
            >
              Argyle Boma
            </label>
            {selectedDates.length > 0 && (
               <span className="font-semibold text-orange-700 bg-orange-50 px-3 py-1 rounded-full text-sm">
                 Total Extra: R {totalCost}
               </span>
            )}
          </div>
          
          <div className="text-muted-foreground space-y-3 mt-2">
            <p>
              This boma, overlooking the Shlaralumi River with magnificent sunsets, is a ten minute drive from the main camp.
            </p>
            <p>
              It is a popular venue for sun-downers or an "off-bungalow" braai, but has no water.
            </p>
            <p>
              It also boasts a "long-drop" loo with a spectacular view!
            </p>
            <p className="font-medium text-foreground">
              Select the days you would like to book the boma:
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 my-3">
              {availableDates.map((date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const isSelected = selectedDates.includes(dateStr);
                const isBlocked = availability?.[dateStr]?.bomaBlocked;

                return (
                  <div 
                    key={dateStr} 
                    className={`
                      flex items-center space-x-2 p-2 rounded border transition-colors
                      ${isBlocked 
                        ? "bg-secondary/50 border-border cursor-not-allowed opacity-70" 
                        : isSelected 
                          ? "bg-orange-50 border-orange-200 cursor-pointer" 
                          : "bg-background border-border hover:bg-accent cursor-pointer"
                      }
                    `}
                    onClick={() => !isBlocked && toggleDate(dateStr)}
                  >
                    <Checkbox
                      id={`boma-${dateStr}`}
                      checked={isSelected}
                      onCheckedChange={() => !isBlocked && toggleDate(dateStr)}
                      disabled={isBlocked}
                      className={isBlocked ? "" : "data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"}
                    />
                    <label 
                      htmlFor={`boma-${dateStr}`}
                      className={`text-sm font-medium select-none flex-grow flex justify-between items-center ${isBlocked ? "cursor-not-allowed text-muted-foreground" : "cursor-pointer"}`}
                    >
                      <span>{format(date, "EEE, d MMM")}</span>
                      {isBlocked && (
                        <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded ml-2">
                          Booked
                        </span>
                      )}
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
              <p className="font-semibold text-primary flex items-center">
                Cost: R350.00 <span className="font-normal text-muted-foreground ml-1">- per afternoon/evening braai (incl. firewood)</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BomaBooking;
