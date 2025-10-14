import BookingHeader from "@/components/BookingHeader";
import Calendar from "@/components/Calendar";
import BookingForm from "@/components/BookingForm";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BookingHeader />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Calendar />
          </div>
          <div>
            <BookingForm />
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-muted-foreground py-6 mt-8">
        © 2025 Ingwelala • Internal booking system • Sibon capacity 16
      </footer>
    </div>
  );
};

export default Index;
