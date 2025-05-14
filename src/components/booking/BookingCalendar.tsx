
import { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Booking, Room, bookings, rooms } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const BookingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Get all bookings for the selected date
  const getDayBookings = (date: Date) => {
    return bookings.filter(booking => 
      isSameDay(booking.startTime, date)
    );
  };
  
  // Display bookings for selected date
  const selectedDateBookings = selectedDate ? getDayBookings(selectedDate) : [];
  
  // Get room name by roomId
  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : 'Unknown Room';
  };
  
  // Format time from Date object to string (HH:MM)
  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedDate 
              ? `Bookings for ${format(selectedDate, 'MMMM d, yyyy')}`
              : 'Select a date to view bookings'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateBookings.length > 0 ? (
            <div className="space-y-4">
              {selectedDateBookings.map((booking) => (
                <div 
                  key={booking.id}
                  className="p-4 border rounded-md bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{booking.title}</h3>
                    <Badge className={
                      booking.status === 'confirmed' ? 'status-available' : 
                      booking.status === 'pending' ? 'status-pending' : 
                      'status-booked'
                    }>
                      {booking.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Room:</span> {getRoomName(booking.roomId)}
                    </div>
                    <div>
                      <span className="font-medium">Booked by:</span> {booking.bookedBy}
                    </div>
                    <div>
                      <span className="font-medium">Time:</span> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </div>
                    <div>
                      <span className="font-medium">Attendees:</span> {booking.attendees}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {selectedDate 
                ? 'No bookings for this date.' 
                : 'Please select a date to view bookings.'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingCalendar;
