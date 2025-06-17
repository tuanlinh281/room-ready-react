
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
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteBooking } from '@/lib/database';
import { useQueryClient } from '@tanstack/react-query';
import EditBookingDialog from './EditBookingDialog';

interface BookingListProps {
  bookings: Booking[];
}

const BookingList: React.FC<BookingListProps> = ({ bookings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: rooms = [] } = useRooms();
  const queryClient = useQueryClient();

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

  // Edit booking
  const editBooking = (booking: Booking) => {
    setEditingBooking(booking);
  };

  // Delete booking
  const handleDeleteBooking = async () => {
    if (!deletingBooking) return;

    setIsDeleting(true);
    try {
      await deleteBooking(deletingBooking.id);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'room', deletingBooking.roomId] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'today'] });
      
      toast.success("Booking deleted successfully!");
      setDeletingBooking(null);
    } catch (error) {
      console.error('Delete booking error:', error);
      toast.error("Failed to delete booking. Please try again.");
    } finally {
      setIsDeleting(false);
    }
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
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => viewBookingDetails(booking)}
                      >
                        Details
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => editBooking(booking)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setDeletingBooking(booking)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

      {/* View Booking Details Dialog */}
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => editBooking(selectedBooking)}>
                Edit
              </Button>
              <Button onClick={() => setSelectedBooking(null)}>Close</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Edit Booking Dialog */}
      <EditBookingDialog 
        booking={editingBooking}
        isOpen={!!editingBooking}
        onClose={() => setEditingBooking(null)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingBooking} onOpenChange={(open) => !open && setDeletingBooking(null)}>
        {deletingBooking && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Booking</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this booking? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="font-medium">{deletingBooking.title}</p>
                <p className="text-sm text-muted-foreground">
                  {getRoomName(deletingBooking.roomId)} • {format(deletingBooking.startTime, 'MMM d, yyyy')} • {format(deletingBooking.startTime, 'HH:mm')} - {format(deletingBooking.endTime, 'HH:mm')}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeletingBooking(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteBooking} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default BookingList;
