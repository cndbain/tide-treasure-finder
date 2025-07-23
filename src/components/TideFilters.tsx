import { useState } from "react";
import { Sliders, Sun, Moon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface TideFiltersProps {
  maxTideLevel: number;
  onMaxTideLevelChange: (level: number) => void;
  daylightOnly: boolean;
  onDaylightOnlyChange: (enabled: boolean) => void;
}

const TideFilters = ({
  maxTideLevel,
  onMaxTideLevelChange,
  daylightOnly,
  onDaylightOnlyChange,
}: TideFiltersProps) => {
  const [inputValue, setInputValue] = useState(maxTideLevel.toString());

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onMaxTideLevelChange(numValue);
    }
  };

  return (
    <Card className="p-6 bg-gradient-surface border-primary/20 shadow-gentle">
      <div className="space-y-6">
        <div className="flex items-center space-x-2 text-center">
          <Sliders className="w-5 h-5 text-primary animate-wave" />
          <h3 className="text-lg font-semibold text-foreground">Tide Pool Filters</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tide-level" className="text-sm font-medium text-foreground">
              Maximum Tide Level (feet)
            </Label>
            <div className="relative">
              <Input
                id="tide-level"
                type="number"
                step="0.1"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                className="bg-background/80 border-primary/30 focus:border-primary"
                placeholder="0.0"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                ft
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Show tide pools accessible when tide is at or below this level
            </p>
          </div>

          <div className="flex items-center justify-between space-x-4 p-3 bg-card/50 rounded-lg border border-primary/20">
            <div className="flex items-center space-x-3">
              {daylightOnly ? (
                <Sun className="w-5 h-5 text-accent animate-wave" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
              <div>
                <Label htmlFor="daylight-only" className="text-sm font-medium text-foreground cursor-pointer">
                  Daylight Hours Only
                </Label>
                <p className="text-xs text-muted-foreground">
                  Filter to show only low tides during daylight
                </p>
              </div>
            </div>
            <Switch
              id="daylight-only"
              checked={daylightOnly}
              onCheckedChange={onDaylightOnlyChange}
              className="data-[state=checked]:bg-accent"
            />
          </div>
        </div>

        <div className="bg-primary-soft/20 border border-primary/30 rounded-lg p-3">
          <p className="text-xs text-center text-primary font-medium">
            💡 Lower tides reveal more tide pools and marine life
          </p>
        </div>
      </div>
    </Card>
  );
};

export default TideFilters;