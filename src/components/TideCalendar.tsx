import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Waves } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TideData {
  date: string;
  minTide: number;
  maxTide: number;
  lowTides: Array<{
    time: string;
    height: number;
    isDaylight: boolean;
  }>;
  isGoodDay: boolean;
}

interface TideCalendarProps {
  tideData: TideData[];
  maxTideLevel: number;
  daylightOnly: boolean;
}

const TideCalendar = ({ tideData, maxTideLevel, daylightOnly }: TideCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const tideInfo = tideData.find(t => t.date === dateStr);
      days.push({
        day,
        date: dateStr,
        tideInfo
      });
    }
    
    return days;
  };

  const isGoodTideDay = (tideInfo: TideData) => {
    if (!tideInfo) return false;
    
    const relevantTides = daylightOnly 
      ? tideInfo.lowTides.filter(tide => tide.isDaylight)
      : tideInfo.lowTides;
    
    return relevantTides.some(tide => tide.height <= maxTideLevel);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="p-6 bg-gradient-surface border-primary/20 shadow-gentle">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary animate-wave" />
            <h3 className="text-lg font-semibold text-foreground">Best Tide Pool Days</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="border-primary/30 hover:bg-primary-soft/20"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-[140px] text-center font-medium text-foreground">
              {formatMonthYear(currentMonth)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="border-primary/30 hover:bg-primary-soft/20"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {days.map((dayInfo, index) => {
            if (!dayInfo) {
              return <div key={index} className="p-2 h-12"></div>;
            }
            
            const isGoodDay = dayInfo.tideInfo && isGoodTideDay(dayInfo.tideInfo);
            const isToday = dayInfo.date === new Date().toISOString().split('T')[0];
            
            return (
              <div
                key={dayInfo.date}
                className={`
                  p-2 h-12 rounded-lg border text-center relative transition-all duration-300
                  ${isGoodDay 
                    ? 'bg-gradient-tide border-accent text-accent-foreground shadow-gentle animate-tide-rise' 
                    : 'bg-card/30 border-border hover:bg-card/50'
                  }
                  ${isToday ? 'ring-2 ring-primary' : ''}
                `}
              >
                <div className="text-sm font-medium">{dayInfo.day}</div>
                {isGoodDay && (
                  <Waves className="w-3 h-3 absolute bottom-1 right-1 text-accent animate-wave" />
                )}
                {dayInfo.tideInfo && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs">
                    <div className={`w-1 h-1 rounded-full ${
                      dayInfo.tideInfo.minTide <= maxTideLevel ? 'bg-accent' : 'bg-muted-foreground'
                    }`}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground bg-card/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded bg-gradient-tide"></div>
            <span>Great for tide pooling</span>
          </div>
          <div className="flex items-center space-x-2">
            <Waves className="w-3 h-3 text-accent" />
            <span>Low tide day</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TideCalendar;