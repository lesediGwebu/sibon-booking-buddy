// South African Public Holidays and School Holidays
// Source: https://www.gov.za/public-holidays

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  type: 'public' | 'school';
}

// Public Holidays (these repeat annually)
const publicHolidayTemplates = [
  { month: 1, day: 1, name: "New Year's Day" },
  { month: 3, day: 21, name: "Human Rights Day" },
  { month: 4, day: 18, name: "Good Friday" }, // Varies
  { month: 4, day: 21, name: "Family Day" }, // Day after Easter
  { month: 4, day: 27, name: "Freedom Day" },
  { month: 5, day: 1, name: "Workers' Day" },
  { month: 6, day: 16, name: "Youth Day" },
  { month: 8, day: 9, name: "National Women's Day" },
  { month: 9, day: 24, name: "Heritage Day" },
  { month: 12, day: 16, name: "Day of Reconciliation" },
  { month: 12, day: 25, name: "Christmas Day" },
  { month: 12, day: 26, name: "Day of Goodwill" },
];

// Easter calculation (Computus algorithm)
function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// School Holiday periods for South Africa
const schoolHolidayTemplates = [
  // Summer holidays (Dec-Jan)
  { startMonth: 12, startDay: 15, endMonth: 1, endDay: 15, name: "Summer Holidays" },
  // Autumn holidays (March/April)
  { startMonth: 3, startDay: 25, endMonth: 4, endDay: 5, name: "Autumn Break" },
  // Winter holidays (June/July)
  { startMonth: 6, startDay: 24, endMonth: 7, endDay: 14, name: "Winter Holidays" },
  // Spring holidays (September)
  { startMonth: 9, startDay: 23, endMonth: 10, endDay: 2, name: "Spring Break" },
];

// Generate public holidays for a specific year
function getPublicHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];
  
  // Easter-based holidays
  const easter = getEasterDate(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  const familyDay = new Date(easter);
  familyDay.setDate(easter.getDate() + 1);
  
  holidays.push({
    date: formatDate(goodFriday),
    name: "Good Friday",
    type: 'public'
  });
  
  holidays.push({
    date: formatDate(familyDay),
    name: "Family Day",
    type: 'public'
  });
  
  // Fixed public holidays
  publicHolidayTemplates.forEach(template => {
    if (template.name === "Good Friday" || template.name === "Family Day") return; // Skip, already added
    
    const date = new Date(year, template.month - 1, template.day);
    holidays.push({
      date: formatDate(date),
      name: template.name,
      type: 'public'
    });
  });
  
  return holidays;
}

// Generate school holidays for a specific year
function getSchoolHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];
  
  schoolHolidayTemplates.forEach(template => {
    const startYear = template.startMonth === 12 ? year - 1 : year;
    const endYear = template.endMonth === 1 && template.startMonth === 12 ? year : year;
    
    const startDate = new Date(startYear, template.startMonth - 1, template.startDay);
    const endDate = new Date(endYear, template.endMonth - 1, template.endDay);
    
    // Add each day in the range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getFullYear() === year || (template.startMonth === 12 && d.getFullYear() === year + 1)) {
        holidays.push({
          date: formatDate(new Date(d)),
          name: template.name,
          type: 'school'
        });
      }
    }
  });
  
  return holidays;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Main function: Get all peak season dates for a year
export function getPeakSeasonDates(year: number): Set<string> {
  const peakDates = new Set<string>();
  
  // Add public holidays
  const publicHolidays = getPublicHolidays(year);
  publicHolidays.forEach(holiday => peakDates.add(holiday.date));
  
  // Add school holidays
  const schoolHolidays = getSchoolHolidays(year);
  schoolHolidays.forEach(holiday => peakDates.add(holiday.date));
  
  // Add all weekends (Friday, Saturday, Sunday)
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) {
        peakDates.add(formatDate(date));
      }
    }
  }
  
  return peakDates;
}

// Check if a specific date is peak season
export function isPeakSeason(dateStr: string): boolean {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const peakDates = getPeakSeasonDates(year);
  return peakDates.has(dateStr);
}

// Get holiday name for a date (if any)
export function getHolidayName(dateStr: string): string | null {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  
  const allHolidays = [...getPublicHolidays(year), ...getSchoolHolidays(year)];
  const holiday = allHolidays.find(h => h.date === dateStr);
  
  return holiday ? holiday.name : null;
}
