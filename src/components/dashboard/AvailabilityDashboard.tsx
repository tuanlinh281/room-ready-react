
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { rooms, bookings, Room, Booking, getTodayBookings } from '@/lib/data';

const AvailabilityDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);

  useEffect(() => {
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Get today's bookings
    setTodayBookings(getTodayBookings());

    // Calculate available rooms (rooms without current bookings)
    const now = new Date();
    const unavailableRoomIds = bookings
      .filter(booking => booking.startTime <= now && booking.endTime > now)
      .map(booking => booking.roomId);
    
    setAvailableRooms(rooms.filter(room => !unavailableRoomIds.includes(room.id)));

    return () => clearInterval(timer);
  }, []);

  // Get upcoming bookings (next 3 hours)
  const getUpcomingBookings = () => {
    const now = new Date();
    const threeHoursLater = new Date(now);
    threeHoursLater.setHours(now.getHours() + 3);

    return bookings
      .filter(booking => booking.startTime >= now && booking.startTime <= threeHoursLater)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 5);
  };

  const upcomingBookings = getUpcomingBookings();

  // Get room name by roomId
  const getRoomName = (roomId: string) => {
    const room = rooms.find(room => room.id === roomId);
    return room ? room.name : 'Unknown Room';
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Current Availability Card */}
      <Card className="col-span-full md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl">Current Availability</CardTitle>
            <CardDescription>As of {format(currentTime, 'h:mm a')}</CardDescription>
          </div>
          <Badge variant="outline" className="text-sm font-medium">
            {availableRooms.length} Available
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableRooms.length > 0 ? (
              availableRooms.map(room => (
                <div key={room.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{room.name}</p>
                    <p className="text-sm text-muted-foreground">{room.location}</p>
                  </div>
                  <Button asChild size="sm">
                    <Link to={`/rooms/${room.id}`}>Book Now</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                All rooms are currently booked.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Bookings Card */}
      <Card className="col-span-full md:col-span-1">
        <CardHeader>
          <CardTitle className="text-xl">Upcoming Bookings</CardTitle>
          <CardDescription>Next few hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{booking.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {getRoomName(booking.roomId)} • {format(booking.startTime, 'h:mm a')}
                    </p>
                  </div>
                  <Badge className={
                    booking.status === 'confirmed' ? 'status-available' : 
                    booking.status === 'pending' ? 'status-pending' : 
                    'status-booked'
                  }>
                    {booking.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No upcoming bookings in the next few hours.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule Card */}
      <Card className="col-span-full md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-xl">Today's Schedule</CardTitle>
          <CardDescription>{format(currentTime, 'EEEE, MMMM d')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayBookings.length > 0 ? (
              todayBookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div>
                    <p className="font-medium">{booking.title}</p>
                    <div className="flex text-sm text-muted-foreground gap-2">
                      <span>{getRoomName(booking.roomId)}</span>
                      <span>•</span>
                      <span>{format(booking.startTime, 'h:mm')} - {format(booking.endTime, 'h:mm a')}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No bookings scheduled for today.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilityDashboard;
