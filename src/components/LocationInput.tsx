import { useState } from "react";
import { MapPin, Navigation, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface LocationInputProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
  currentLocation?: { lat: number; lng: number; name: string };
}

const LocationInput = ({ onLocationSelect, currentLocation }: LocationInputProps) => {
  const [locationInput, setLocationInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getCurrentLocation = () => {
    setIsLoading(true);
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode to get location name
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          const locationName = data.city || data.locality || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          onLocationSelect(latitude, longitude, locationName);
          toast({
            title: "Location found!",
            description: `Using your current location: ${locationName}`,
          });
        } catch (error) {
          onLocationSelect(latitude, longitude, `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          toast({
            title: "Location found!",
            description: "Using your current coordinates.",
          });
        }
        setIsLoading(false);
      },
      (error) => {
        toast({
          title: "Location error",
          description: "Could not get your current location. Please enter manually.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    );
  };

  const searchLocation = async () => {
    if (!locationInput.trim()) return;
    
    setIsLoading(true);
    try {
      // Using a simple geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/geocode-forward-client?query=${encodeURIComponent(locationInput)}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        onLocationSelect(result.lat, result.lng, result.formattedAddress);
        toast({
          title: "Location found!",
          description: `Found: ${result.formattedAddress}`,
        });
        setLocationInput("");
      } else {
        toast({
          title: "Location not found",
          description: "Please try a different search term.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Search error",
        description: "Could not search for location. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <Card className="p-6 bg-gradient-surface border-primary/20 shadow-gentle">
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <MapPin className="w-5 h-5 text-primary animate-wave" />
            <h2 className="text-xl font-semibold text-foreground">Find Your Tide Pools</h2>
          </div>
          <p className="text-muted-foreground">
            Enter a location or use your current position to find nearby tide pools
          </p>
        </div>

        {currentLocation && (
          <div className="bg-primary-soft/50 border border-primary/30 rounded-lg p-3 text-center animate-tide-rise">
            <p className="text-sm font-medium text-primary">
              Current location: {currentLocation.name}
            </p>
          </div>
        )}

        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Enter city, address, or zip code..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchLocation()}
              className="bg-background/80 border-primary/30 focus:border-primary"
            />
          </div>
          <Button
            onClick={searchLocation}
            disabled={!locationInput.trim() || isLoading}
            className="bg-gradient-ocean hover:opacity-90 transition-all duration-300"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={getCurrentLocation}
            disabled={isLoading}
            variant="outline"
            className="border-primary/30 hover:bg-primary-soft/20 transition-all duration-300"
          >
            <Navigation className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Getting location..." : "Use Current Location"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LocationInput;