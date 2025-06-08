
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Booking } from '@/lib/data';
import { useRooms } from '@/hooks/useRooms';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BookingListProps {
  bookings: Booking[];
}

const BookingList: React.FC<BookingListProps> = ({ bookings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { data: rooms = [] } = useRooms();

  // Filter bookings by search term
  const filteredBookings = searchTerm
    ? bookings.filter(booking => 
        booking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.bookedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getRoomName(booking.roomId).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : bookings;

  // Get room name by roomId
  const getRoomName = (roomId: string) => {
    const room = rooms.find(room => room.id === roomId);
    return room ? room.name : 'Unknown Room';
  };

  // View booking details
  const viewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Upcoming Bookings</h2>
        <div className="relative w-full sm:w-64">
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {filteredBookings.length > 0 ? (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meeting</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.title}</TableCell>
                  <TableCell>{getRoomName(booking.roomId)}</TableCell>
                  <TableCell>{format(booking.startTime, 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    {format(booking.startTime, 'HH:mm')} - {format(booking.endTime, 'HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      booking.status === 'confirmed' ? 'status-available' : 
                      booking.status === 'pending' ? 'status-pending' : 
                      'status-booked'
                    }>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => viewBookingDetails(booking)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md bg-gray-50">
          <p className="text-gray-500">No bookings found.</p>
        </div>
      )}

      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        {selectedBooking && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedBooking.title}</DialogTitle>
              <DialogDescription>
                Booking details
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <Label className="font-medium">Room</Label>
                <div>{getRoomName(selectedBooking.roomId)}</div>
                
                <Label className="font-medium">Date</Label>
                <div>{format(selectedBooking.startTime, 'MMMM d, yyyy')}</div>
                
                <Label className="font-medium">Time</Label>
                <div>
                  {format(selectedBooking.startTime, 'HH:mm')} - {format(selectedBooking.endTime, 'HH:mm')}
                </div>
                
                <Label className="font-medium">Booked By</Label>
                <div>{selectedBooking.bookedBy}</div>
                
                <Label className="font-medium">Attendees</Label>
                <div>{selectedBooking.attendees}</div>
                
                <Label className="font-medium">Status</Label>
                <div>
                  <Badge className={
                    selectedBooking.status === 'confirmed' ? 'status-available' : 
                    selectedBooking.status === 'pending' ? 'status-pending' : 
                    'status-booked'
                  }>
                    {selectedBooking.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setSelectedBooking(null)}>Close</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default BookingList;
