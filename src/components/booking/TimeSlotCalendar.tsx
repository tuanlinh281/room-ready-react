
import React, { useState } from 'react';
import { format, addHours, startOfDay, isSameHour, isAfter, isBefore } from 'date-fns';
import { Booking } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock } from 'lucide-react';
import BookingForm from './BookingForm';

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
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  
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
  
  console.log('Room bookings for', roomId, 'on', format(selectedDate, 'yyyy-MM-dd'), ':', roomBookings);
  
  // Check if a time slot is booked - fixed overlap detection
  const isSlotBooked = (slotStart: Date, slotEnd: Date) => {
    const isBooked = roomBookings.some(booking => {
      // A booking overlaps with our slot if:
      // booking starts before our slot ends AND booking ends after our slot starts
      const overlaps = booking.startTime < slotEnd && booking.endTime > slotStart;
      console.log('Checking overlap for slot', format(slotStart, 'HH:mm'), '-', format(slotEnd, 'HH:mm'), 
                  'with booking', format(booking.startTime, 'HH:mm'), '-', format(booking.endTime, 'HH:mm'), 
                  ':', overlaps);
      return overlaps;
    });
    return isBooked;
  };
  
  // Get booking for a specific time slot
  const getSlotBooking = (slotStart: Date, slotEnd: Date) => {
    return roomBookings.find(booking => 
      booking.startTime < slotEnd && booking.endTime > slotStart
    );
  };
  
  const handleSlotClick = (slotStart: Date) => {
    const slotEnd = addHours(slotStart, 1);
    if (!isSlotBooked(slotStart, slotEnd)) {
      console.log('Time slot selected:', slotStart, 'to', slotEnd);
      if (onTimeSlotSelect) {
        onTimeSlotSelect(slotStart, slotEnd);
      }
    }
  };

  const handleBookClick = (slotStart: Date, slotEnd: Date, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedSlot({ start: slotStart, end: slotEnd });
    setIsBookingDialogOpen(true);
  };

  const handleBookingComplete = () => {
    setIsBookingDialogOpen(false);
    setSelectedSlot(null);
  };

  return (
    <>
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
                    
                    {!isBooked && !isPast && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => handleBookClick(start, end, e)}
                      >
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

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book {roomName}</DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <BookingForm 
              roomId={roomId}
              onBookingComplete={handleBookingComplete}
              preselectedStartTime={selectedSlot.start}
              preselectedEndTime={selectedSlot.end}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TimeSlotCalendar;
