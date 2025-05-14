
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import BookingList from '@/components/booking/BookingList';
import BookingCalendar from '@/components/booking/BookingCalendar';
import { bookings } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Bookings = () => {
  const navigate = useNavigate();
  
  // Sort bookings with most recent first
  const sortedBookings = [...bookings].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
            <p className="text-muted-foreground">
              Manage your meeting room reservations.
            </p>
          </div>
          <Button onClick={() => navigate('/rooms')}>
            New Booking
          </Button>
        </div>
        
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>
                  View and manage all your meeting room bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookingList bookings={sortedBookings} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>
                  View your bookings on a calendar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookingCalendar />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Bookings;
