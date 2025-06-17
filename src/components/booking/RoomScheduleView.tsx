
import React, { useState } from 'react';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { useRoomBookings } from '@/hooks/useBookings';
import { useRoom } from '@/hooks/useRooms';
import TimeSlotCalendar from './TimeSlotCalendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RoomScheduleViewProps {
  roomId: string;
  onTimeSlotSelect?: (startTime: Date, endTime: Date) => void;
}

const RoomScheduleView: React.FC<RoomScheduleViewProps> = ({ 
  roomId, 
  onTimeSlotSelect 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data: room } = useRoom(roomId);
  const { data: bookings = [] } = useRoomBookings(roomId);
  
  const handlePreviousDay = () => {
    setSelectedDate(prev => addDays(prev, -1));
  };
  
  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };
  
  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const days = [];
    
    for (let day = start; day <= end; day = addDays(day, 1)) {
      days.push(new Date(day));
    }
    
    return days;
  };

  if (!room) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Room not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="day" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="day">Day View</TabsTrigger>
          <TabsTrigger value="week">Week View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="day" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Day Schedule</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousDay}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium min-w-[120px] text-center">
                    {format(selectedDate, 'MMM d, yyyy')}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextDay}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => setSelectedDate(new Date())}
                className="mb-4"
              >
                Today
              </Button>
            </CardContent>
          </Card>
          
          <TimeSlotCalendar
            roomId={roomId}
            roomName={room.name}
            bookings={bookings}
            selectedDate={selectedDate}
            onTimeSlotSelect={onTimeSlotSelect}
          />
        </TabsContent>
        
        <TabsContent value="week" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Week View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {getWeekDays().map(day => (
                  <div key={day.getTime()} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">
                      {format(day, 'EEEE, MMM d')}
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      {bookings
                        .filter(booking => 
                          format(booking.startTime, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                        )
                        .map(booking => (
                          <div key={booking.id} className="mb-1">
                            {format(booking.startTime, 'HH:mm')} - {format(booking.endTime, 'HH:mm')}: {booking.title}
                          </div>
                        ))
                      }
                      {bookings.filter(booking => 
                        format(booking.startTime, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                      ).length === 0 && (
                        <span className="text-green-600">No bookings</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          
          <TimeSlotCalendar
            roomId={roomId}
            roomName={room.name}
            bookings={bookings}
            selectedDate={selectedDate}
            onTimeSlotSelect={onTimeSlotSelect}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoomScheduleView;
