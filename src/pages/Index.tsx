import { useState, useEffect } from "react";
import { Waves, Clock, MapPin } from "lucide-react";
import LocationInput from "@/components/LocationInput";
import TideFilters from "@/components/TideFilters";
import TideCalendar from "@/components/TideCalendar";
import TideDetail from "@/components/TideDetail";
import { useTideData, type TideData } from "@/hooks/useTideData";
import tidepoolHero from "@/assets/tide-pool-hero.jpg";


const Index = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string } | undefined>();
  const [maxTideLevel, setMaxTideLevel] = useState(0);
  const [daylightOnly, setDaylightOnly] = useState(true);
  const [selectedDay, setSelectedDay] = useState<TideData | null>(null);
  
  const { tideData, isLoading, findNearbyStations } = useTideData();

  const handleLocationSelect = (lat: number, lng: number, name: string) => {
    setLocation({ lat, lng, name });
    findNearbyStations(lat, lng);
  };

  const handleDayClick = (tideData: TideData) => {
    setSelectedDay(tideData);
    // Push a new history state when opening the modal
    window.history.pushState({ modal: 'tide-detail' }, '', window.location.href);
  };

  const handleCloseTideDetail = () => {
    setSelectedDay(null);
  };

  // Handle browser back button to close modal
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (selectedDay) {
        // If modal is open and back button is pressed, close it
        setSelectedDay(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [selectedDay]);

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="h-96 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${tidepoolHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/30 to-primary/60"></div>
          <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
            <div className="max-w-4xl space-y-4">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Waves className="w-8 h-8 text-primary-foreground animate-wave" />
                <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground">
                  Tide Pool Explorer
                </h1>
                <Waves className="w-8 h-8 text-primary-foreground animate-wave" style={{ animationDelay: '1s' }} />
              </div>
              <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto">
                Discover the perfect times to explore tide pools near you
              </p>
              <p className="text-lg text-primary-foreground/80 max-w-3xl mx-auto">
                Find low tide schedules, plan your coastal adventures, and experience the wonders of marine life revealed by the ocean's rhythm
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Location and Filters Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LocationInput 
              onLocationSelect={handleLocationSelect}
              currentLocation={location}
            />
          </div>
          <div>
            <TideFilters
              maxTideLevel={maxTideLevel}
              onMaxTideLevelChange={setMaxTideLevel}
              daylightOnly={daylightOnly}
              onDaylightOnlyChange={setDaylightOnly}
            />
          </div>
        </div>

        {/* Status and Loading */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2 text-primary">
              <Waves className="w-6 h-6 animate-wave" />
              <span className="text-lg font-medium">Loading tide data...</span>
              <Waves className="w-6 h-6 animate-wave" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        )}

        {!location && !isLoading && (
          <div className="text-center py-12 space-y-4">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <MapPin className="w-6 h-6" />
              <Clock className="w-6 h-6" />
              <Waves className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Ready to Explore?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Enter your location above to discover the best times for tide pooling. 
              We'll show you when the tides are low enough to reveal hidden marine treasures.
            </p>
          </div>
        )}

        {/* Tide Calendar */}
        {location && tideData.length > 0 && (
          <div className="space-y-4">
            <TideCalendar
              tideData={tideData}
              maxTideLevel={maxTideLevel}
              daylightOnly={daylightOnly}
              onDayClick={handleDayClick}
            />
            
            {/* Location Info */}
            <div className="bg-card/50 border border-primary/20 rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Showing tide predictions for <span className="font-medium text-foreground">{location.name}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Data provided by NOAA Tides and Currents
              </p>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="bg-gradient-tide border border-accent/30 rounded-lg p-6 shadow-gentle">
          <h3 className="text-lg font-semibold text-accent-foreground mb-3 flex items-center">
            <Waves className="w-5 h-5 mr-2 animate-wave" />
            Tide Pooling Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-accent-foreground/90">
            <div>
              <p className="font-medium mb-1">🌊 Best Times</p>
              <p>Visit 1-2 hours before the lowest tide for the best experience</p>
            </div>
            <div>
              <p className="font-medium mb-1">👟 Safety First</p>
              <p>Wear non-slip shoes and watch for wet, slippery rocks</p>
            </div>
            <div>
              <p className="font-medium mb-1">🔍 Look Carefully</p>
              <p>Many creatures are small and well-camouflaged</p>
            </div>
            <div>
              <p className="font-medium mb-1">🤲 Don't Touch</p>
              <p>Tide pools are fragile, look with your eyes and don't touch</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tide Detail Modal */}
      {selectedDay && (
        <TideDetail
          selectedDay={selectedDay}
          onClose={handleCloseTideDetail}
          maxTideLevel={maxTideLevel}
          daylightOnly={daylightOnly}
        />
      )}
    </div>
  );
};

export default Index;