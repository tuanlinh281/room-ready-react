
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createBooking, isRoomAvailable } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';

const bookingFormSchema = z.object({
  title: z.string().min(3, { message: 'Meeting title is required' }),
  date: z.date({ required_error: 'Please select a date' }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Please enter a valid time (HH:MM)' }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Please enter a valid time (HH:MM)' }),
  attendees: z.coerce.number().int().min(1).max(50),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  roomId: string;
  onBookingComplete?: () => void;
  preselectedStartTime?: Date | null;
  preselectedEndTime?: Date | null;
}

const BookingForm: React.FC<BookingFormProps> = ({ 
  roomId, 
  onBookingComplete,
  preselectedStartTime,
  preselectedEndTime
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      title: '',
      attendees: 1,
      startTime: '09:00',
      endTime: '10:00',
    },
  });

  // Update form when preselected times change
  useEffect(() => {
    if (preselectedStartTime && preselectedEndTime) {
      const startTimeString = format(preselectedStartTime, 'HH:mm');
      const endTimeString = format(preselectedEndTime, 'HH:mm');
      
      form.setValue('date', preselectedStartTime);
      form.setValue('startTime', startTimeString);
      form.setValue('endTime', endTimeString);
    }
  }, [preselectedStartTime, preselectedEndTime, form]);

  const onSubmit = async (data: BookingFormValues) => {
    if (!user) {
      toast.error("You must be logged in to book a room");
      return;
    }

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
      
      // Check room availability
      const available = await isRoomAvailable(roomId, startDateTime, endDateTime);
      if (!available) {
        toast.error("Room is not available for the selected time slot");
        setIsSubmitting(false);
        return;
      }
      
      // Create booking in database
      await createBooking({
        roomId,
        title: data.title,
        startTime: startDateTime,
        endTime: endDateTime,
        bookedBy: user.email || 'Unknown User',
        attendees: data.attendees,
      });
      
      toast.success("Room booked successfully!");
      
      if (onBookingComplete) {
        onBookingComplete();
      }
      
      // Reset form
      form.reset();
    } catch (error) {
      console.error('Booking error:', error);
      toast.error("Failed to book room. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Booking...' : 'Book Room'}
        </Button>
      </form>
    </Form>
  );
};

export default BookingForm;
