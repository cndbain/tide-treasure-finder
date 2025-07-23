import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface TideStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance?: number;
}

interface TidePrediction {
  date: string;
  time: string;
  height: number;
  type: 'H' | 'L'; // High or Low tide
}

export interface TideData {
  date: string;
  minTide: number;
  maxTide: number;
  lowTides: Array<{
    time: string;
    height: number;
    isDaylight: boolean;
  }>;
  highTides: Array<{
    time: string;
    height: number;
    isDaylight: boolean;
  }>;
  isGoodDay: boolean;
}

export const useTideData = () => {
  const [tideStations, setTideStations] = useState<TideStation[]>([]);
  const [tideData, setTideData] = useState<TideData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const findNearbyStations = async (lat: number, lng: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // NOAA Tides and Currents API endpoint for stations
      const response = await fetch(
        `https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions&units=english`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stations: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.stations) {
        throw new Error("No stations data received");
      }
      
      // Calculate distances and find nearest stations
      const stationsWithDistance = data.stations.map((station: any) => ({
        id: station.id,
        name: station.name,
        lat: parseFloat(station.lat),
        lng: parseFloat(station.lng),
        distance: calculateDistance(lat, lng, parseFloat(station.lat), parseFloat(station.lng))
      }));
      
      // Sort by distance and take the closest 5
      const nearestStations = stationsWithDistance
        .sort((a: TideStation, b: TideStation) => (a.distance || 0) - (b.distance || 0))
        .slice(0, 5);
      
      setTideStations(nearestStations);
      
      // Automatically fetch tide data for the nearest station
      if (nearestStations.length > 0) {
        await fetchTideData(nearestStations[0].id);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to find tide stations';
      setError(errorMessage);
      toast({
        title: "Error finding tide stations",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTideData = async (stationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      
      const formatDate = (date: Date) => {
        return date.getFullYear() + 
               String(date.getMonth() + 1).padStart(2, '0') + 
               String(date.getDate()).padStart(2, '0');
      };
      
      // NOAA API for tide predictions
      const response = await fetch(
        `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?` +
        `product=predictions&application=Lovable&begin_date=${formatDate(startDate)}&` +
        `end_date=${formatDate(endDate)}&datum=MLLW&station=${stationId}&` +
        `time_zone=lst_ldt&units=english&interval=hilo&format=json`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tide data: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.predictions) {
        throw new Error("No tide prediction data received");
      }
      
      // Process the predictions into daily summaries
      const processedData = processTidePredictions(data.predictions);
      setTideData(processedData);
      
      toast({
        title: "Tide data loaded!",
        description: `Found ${processedData.length} days of tide predictions`,
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tide data';
      setError(errorMessage);
      toast({
        title: "Error fetching tide data",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processTidePredictions = (predictions: any[]): TideData[] => {
    const dailyData = new Map<string, TideData>();
    
    predictions.forEach((prediction) => {
      const date = prediction.t.split(' ')[0]; // Extract date part
      const time = prediction.t.split(' ')[1]; // Extract time part
      const height = parseFloat(prediction.v);
      const type = prediction.type;
      
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          date,
          minTide: Infinity,
          maxTide: -Infinity,
          lowTides: [],
          highTides: [],
          isGoodDay: false
        });
      }
      
      const dayData = dailyData.get(date)!;
      
      // Update min/max tides
      dayData.minTide = Math.min(dayData.minTide, height);
      dayData.maxTide = Math.max(dayData.maxTide, height);
      
      // Add low and high tides
      if (type === 'L') {
        dayData.lowTides.push({
          time,
          height,
          isDaylight: isDaylightHour(time)
        });
      } else if (type === 'H') {
        dayData.highTides.push({
          time,
          height,
          isDaylight: isDaylightHour(time)
        });
      }
    });
    
    return Array.from(dailyData.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const isDaylightHour = (timeString: string): boolean => {
    const hour = parseInt(timeString.split(':')[0]);
    return hour >= 6 && hour <= 18; // Simple daylight approximation
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return {
    tideStations,
    tideData,
    isLoading,
    error,
    findNearbyStations,
    fetchTideData
  };
};