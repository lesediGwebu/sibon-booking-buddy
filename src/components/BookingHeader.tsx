const BookingHeader = () => {
  return (
    <header className="relative text-white p-6 md:p-8 rounded-b-lg shadow-lg mb-8 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?q=80&w=2070&auto=format&fit=crop)'
        }}
      />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-hero-brown">
              <span className="font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Sibon (Ingwelala) Booking</h1>
              <p className="text-sm md:text-base opacity-90">Max capacity: 16 guests</p>
            </div>
          </div>
          <a 
            href="#" 
            className="hidden md:inline-block text-white font-semibold py-2 px-4 border border-white rounded-lg hover:bg-white hover:text-foreground transition-colors"
          >
            Visit Site
          </a>
        </div>
      </div>
    </header>
  );
};

export default BookingHeader;
