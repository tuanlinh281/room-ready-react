
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AvailabilityDashboard from '@/components/dashboard/AvailabilityDashboard';
import BookingCalendar from '@/components/booking/BookingCalendar';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRooms } from '@/hooks/useRooms';
import { useBookings } from '@/hooks/useBookings';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import RoomCard from '@/components/booking/RoomCard';

const Index = () => {
  const { data: rooms = [] } = useRooms();
  const { data: bookings = [] } = useBookings();
  
  // Set up real-time subscriptions
  useRealtimeSubscription();

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to RoomReady, your meeting room booking system.
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="rooms">Quick Book</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <AvailabilityDashboard />
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-4">
            <BookingCalendar bookings={bookings} />
          </TabsContent>
          
          <TabsContent value="rooms" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Rooms</CardTitle>
                <CardDescription>
                  Select a room to make a quick booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.slice(0, 3).map((room) => (
                    <RoomCard key={room.id} room={room} isAvailable={true} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Index;
