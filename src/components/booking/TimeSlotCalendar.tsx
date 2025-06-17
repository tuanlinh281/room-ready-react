
import React from 'react';
import { format, addHours, startOfDay, isSameHour, isAfter, isBefore } from 'date-fns';
import { Booking } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface TimeSlotCalendarProps {
  roomId: string;
  roomName: string;
  bookings: Booking[];
  selectedDate: Date;
  onTimeSlotSelect?: (startTime: Date, endTime: Date) => void;
}

const TimeSlotCalendar: React.FC<TimeSlotCalendarProps> = ({
  roomId,
  roomName,
  bookings,
  selectedDate,
  onTimeSlotSelect
}) => {
  const startHour = 8; // 8 AM
  const endHour = 18; // 6 PM
  
  // Generate time slots for the day
  const timeSlots = [];
  const dayStart = startOfDay(selectedDate);
  
  for (let hour = startHour; hour < endHour; hour++) {
    const slotStart = addHours(dayStart, hour);
    const slotEnd = addHours(slotStart, 1);
    timeSlots.push({ start: slotStart, end: slotEnd });
  }
  
  // Filter bookings for this room and date
  const roomBookings = bookings.filter(booking => 
    booking.roomId === roomId && 
    format(booking.startTime, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );
  
  // Check if a time slot is booked
  const isSlotBooked = (slotStart: Date, slotEnd: Date) => {
    return roomBookings.some(booking => 
      (isBefore(booking.startTime, slotEnd) && isAfter(booking.endTime, slotStart)) ||
      isSameHour(booking.startTime, slotStart)
    );
  };
  
  // Get booking for a specific time slot
  const getSlotBooking = (slotStart: Date, slotEnd: Date) => {
    return roomBookings.find(booking => 
      (isBefore(booking.startTime, slotEnd) && isAfter(booking.endTime, slotStart)) ||
      isSameHour(booking.startTime, slotStart)
    );
  };
  
  const handleSlotClick = (slotStart: Date) => {
    if (onTimeSlotSelect && !isSlotBooked(slotStart, addHours(slotStart, 1))) {
      onTimeSlotSelect(slotStart, addHours(slotStart, 1));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {roomName} - {format(selectedDate, 'MMMM d, yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {timeSlots.map(({ start, end }) => {
            const isBooked = isSlotBooked(start, end);
            const booking = getSlotBooking(start, end);
            const isPast = isBefore(end, new Date());
            
            return (
              <div
                key={start.getTime()}
                className={`
                  p-3 border rounded-md transition-colors cursor-pointer
                  ${isBooked 
                    ? 'bg-red-50 border-red-200' 
                    : isPast 
                      ? 'bg-gray-50 border-gray-200 opacity-50' 
                      : 'bg-green-50 border-green-200 hover:bg-green-100'
                  }
                `}
                onClick={() => !isBooked && !isPast && handleSlotClick(start)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">
                      {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
                    </span>
                    <Badge 
                      variant={isBooked ? 'destructive' : isPast ? 'secondary' : 'default'}
                      className="text-xs"
                    >
                      {isBooked ? 'Booked' : isPast ? 'Past' : 'Available'}
                    </Badge>
                  </div>
                  
                  {isBooked && booking && (
                    <div className="text-right">
                      <p className="text-sm font-medium">{booking.title}</p>
                      <p className="text-xs text-muted-foreground">{booking.bookedBy}</p>
                      <p className="text-xs text-muted-foreground">{booking.attendees} attendees</p>
                    </div>
                  )}
                  
                  {!isBooked && !isPast && onTimeSlotSelect && (
                    <Button size="sm" variant="outline">
                      Book
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            Available
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            Booked
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
            Past
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeSlotCalendar;
