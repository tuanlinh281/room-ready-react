
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
import { Label } from '@/components/ui/label';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const bookingFormSchema = z.object({
  title: z.string().min(3, { message: 'Meeting title is required' }),
  date: z.date({ required_error: 'Please select a date' }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Please enter a valid time (HH:MM)' }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Please enter a valid time (HH:MM)' }),
  attendees: z.coerce.number().int().min(1).max(50),
  bookedBy: z.string().min(2, { message: 'Please enter your name' }),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  roomId: string;
  onBookingComplete?: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ roomId, onBookingComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      title: '',
      attendees: 1,
      bookedBy: '',
      startTime: '09:00',
      endTime: '10:00',
    },
  });

  const onSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      
      console.log({
        roomId,
        title: data.title,
        startTime: startDateTime,
        endTime: endDateTime,
        bookedBy: data.bookedBy,
        attendees: data.attendees,
        status: 'confirmed'
      });
      
      toast.success("Room booked successfully!");
      
      if (onBookingComplete) {
        onBookingComplete();
      }
      
      // Reset form
      form.reset();
    } catch (error) {
      console.error(error);
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
        
        <div className="grid grid-cols-2 gap-4">
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
          
          <FormField
            control={form.control}
            name="bookedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Booked By</FormLabel>
                <FormControl>
                  <Input placeholder="Your Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Booking...' : 'Book Room'}
        </Button>
      </form>
    </Form>
  );
};

export default BookingForm;
