import { X, Clock, Sun, Moon, Waves, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type TideData } from "@/hooks/useTideData";

interface TideDetailProps {
  selectedDay: TideData;
  onClose: () => void;
  maxTideLevel: number;
  daylightOnly: boolean;
}

const TideDetail = ({ selectedDay, onClose, maxTideLevel, daylightOnly }: TideDetailProps) => {
  const formatDate = (dateString: string) => {
    // Parse the date string as local time to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${period}`;
  };

  const getGoodTides = () => {
    return selectedDay.lowTides.filter(tide => {
      const meetsTideLevel = tide.height <= maxTideLevel;
      const meetsDaylightReq = !daylightOnly || tide.isDaylight;
      return meetsTideLevel && meetsDaylightReq;
    });
  };

  const goodTides = getGoodTides();
  const allTides = [...selectedDay.lowTides, ...selectedDay.highTides]
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-surface border-primary/20 shadow-ocean animate-tide-rise">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground flex items-center">
                <Waves className="w-6 h-6 mr-2 text-primary animate-wave" />
                Tide Details
              </h2>
              <p className="text-lg text-muted-foreground">{formatDate(selectedDay.date)}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-primary/30 hover:bg-primary-soft/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Tide Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card/50 border border-primary/20 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingDown className="w-5 h-5 text-accent" />
                <span className="font-medium text-foreground">Lowest Tide</span>
              </div>
              <p className="text-2xl font-bold text-accent">{selectedDay.minTide.toFixed(1)}ft</p>
            </div>
            <div className="bg-card/50 border border-primary/20 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Highest Tide</span>
              </div>
              <p className="text-2xl font-bold text-primary">{selectedDay.maxTide.toFixed(1)}ft</p>
            </div>
          </div>

          {/* Good Tide Pool Times */}
          {goodTides.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <Waves className="w-5 h-5 mr-2 text-accent animate-wave" />
                Best Tide Pool Times
              </h3>
              <div className="space-y-2">
                {goodTides.map((tide, index) => (
                  <div
                    key={index}
                    className="bg-gradient-tide border border-accent/30 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {tide.isDaylight ? (
                          <Sun className="w-5 h-5 text-accent" />
                        ) : (
                          <Moon className="w-5 h-5 text-muted-foreground" />
                        )}
                        <Clock className="w-4 h-4 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-accent-foreground">{formatTime(tide.time)}</p>
                        <p className="text-sm text-accent-foreground/80">
                          {tide.isDaylight ? 'Daylight' : 'Night'} • Low Tide
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-accent-foreground">{tide.height.toFixed(1)}ft</p>
                      <p className="text-xs text-accent-foreground/80">
                        {tide.height <= maxTideLevel ? 'Great for exploring!' : 'Above threshold'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {goodTides.length === 0 && (
            <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
              <Waves className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">
                No optimal tide pool times for this day based on your filters
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your tide level or daylight preferences
              </p>
            </div>
          )}

          {/* All Tides */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              All Tides
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allTides.map((tide, index) => {
                const isLowTide = selectedDay.lowTides.includes(tide);
                const isGoodTide = isLowTide && tide.height <= maxTideLevel && (!daylightOnly || tide.isDaylight);
                
                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 flex items-center justify-between ${
                      isGoodTide 
                        ? 'bg-primary-soft/20 border-accent/30' 
                        : 'bg-card/30 border-border'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {tide.isDaylight ? (
                          <Sun className="w-4 h-4 text-accent" />
                        ) : (
                          <Moon className="w-4 h-4 text-muted-foreground" />
                        )}
                        {isLowTide ? (
                          <TrendingDown className="w-4 h-4 text-accent" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{formatTime(tide.time)}</p>
                        <p className="text-sm text-muted-foreground">
                          {isLowTide ? 'Low' : 'High'} Tide
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{tide.height.toFixed(1)}ft</p>
                      {isGoodTide && (
                        <p className="text-xs text-accent">Perfect!</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-sand/20 border border-sand/40 rounded-lg p-4">
            <p className="text-sm text-sand-foreground">
              <span className="font-medium">💡 Tip:</span> Plan to arrive 1-2 hours before the lowest tide 
              for the best tide pool exploration experience.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TideDetail;