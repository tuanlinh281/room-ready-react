
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { updateBooking, isRoomAvailable } from '@/lib/database';
import { Booking } from '@/lib/data';
import { useQueryClient } from '@tanstack/react-query';

const editBookingSchema = z.object({
  title: z.string().min(3, { message: 'Meeting title is required' }),
  date: z.date({ required_error: 'Please select a date' }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Please enter a valid time (HH:MM)' }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Please enter a valid time (HH:MM)' }),
  attendees: z.coerce.number().int().min(1).max(50),
});

type EditBookingFormValues = z.infer<typeof editBookingSchema>;

interface EditBookingDialogProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditBookingDialog: React.FC<EditBookingDialogProps> = ({ booking, isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<EditBookingFormValues>({
    resolver: zodResolver(editBookingSchema),
    defaultValues: booking ? {
      title: booking.title,
      date: booking.startTime,
      startTime: format(booking.startTime, 'HH:mm'),
      endTime: format(booking.endTime, 'HH:mm'),
      attendees: booking.attendees,
    } : undefined,
  });

  // Reset form when booking changes
  React.useEffect(() => {
    if (booking) {
      form.reset({
        title: booking.title,
        date: booking.startTime,
        startTime: format(booking.startTime, 'HH:mm'),
        endTime: format(booking.endTime, 'HH:mm'),
        attendees: booking.attendees,
      });
    }
  }, [booking, form]);

  const onSubmit = async (data: EditBookingFormValues) => {
    if (!booking) return;

    setIsSubmitting(true);
    
    try {
      // Convert time strings to Date objects
      const startHour = parseInt(data.startTime.split(':')[0]);
      const startMinute = parseInt(data.startTime.split(':')[1]);
      const endHour = parseInt(data.endTime.split(':')[0]);
      const endMinute = parseInt(data.endTime.split(':')[1]);
      
      const startDateTime = new Date(data.date);
      startDateTime.setHours(startHour, startMinute, 0, 0);
      
      const endDateTime = new Date(data.date);
      endDateTime.setHours(endHour, endMinute, 0, 0);
      
      // Check if end time is after start time
      if (endDateTime <= startDateTime) {
        toast.error("End time must be after start time");
        setIsSubmitting(false);
        return;
      }
      
      // Check room availability (excluding current booking)
      const currentBookingTime = startDateTime.getTime() !== booking.startTime.getTime() || 
                                endDateTime.getTime() !== booking.endTime.getTime();
      
      if (currentBookingTime) {
        const available = await isRoomAvailable(booking.roomId, startDateTime, endDateTime);
        if (!available) {
          toast.error("Room is not available for the selected time slot");
          setIsSubmitting(false);
          return;
        }
      }
      
      // Update booking in database
      await updateBooking(booking.id, {
        title: data.title,
        startTime: startDateTime,
        endTime: endDateTime,
        attendees: data.attendees,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'room', booking.roomId] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'today'] });
      
      toast.success("Booking updated successfully!");
      onClose();
    } catch (error) {
      console.error('Update booking error:', error);
      toast.error("Failed to update booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogDescription>
            Update your meeting room reservation details.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Weekly Team Meeting" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-10" placeholder="09:00" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-10" placeholder="10:00" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="attendees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Attendees</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Booking'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookingDialog;
