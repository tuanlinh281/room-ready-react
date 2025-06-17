import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import RoomCard from '@/components/booking/RoomCard';
import BookingForm from '@/components/booking/BookingForm';
import RoomScheduleView from '@/components/booking/RoomScheduleView';
import { useRooms, useRoom } from '@/hooks/useRooms';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RoomDetail = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { data: room, isLoading, error } = useRoom(roomId!);
  const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null);
  
  // Set up real-time subscriptions for this page
  useRealtimeSubscription();
  
  const handleTimeSlotSelect = (startTime: Date, endTime: Date) => {
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
    console.log('Selected time slot:', startTime, 'to', endTime);
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">Loading room details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !room) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <h2 className="text-2xl font-bold">Room not found</h2>
          <p className="text-muted-foreground">The room you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/rooms')}>
            View All Rooms
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/rooms')}>
              &larr; All Rooms
            </Button>
          </div>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="book">Quick Book</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="relative rounded-lg overflow-hidden h-[300px]">
                    <img 
                      src={room.image} 
                      alt={room.name} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  
                  <div className="mt-6 space-y-6">
                    <div>
                      <h1 className="text-3xl font-bold">{room.name}</h1>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{room.capacity} people</Badge>
                        <Badge variant="outline">{room.location}</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Description</h2>
                      <p className="text-muted-foreground">{room.description}</p>
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Amenities</h2>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.map((amenity, index) => (
                          <Badge key={index} variant="secondary">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Book This Room</CardTitle>
                      <CardDescription>Fill out the form to make a reservation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BookingForm 
                        roomId={room.id}
                        onBookingComplete={() => navigate('/bookings')}
                        preselectedStartTime={selectedStartTime}
                        preselectedEndTime={selectedEndTime}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="schedule" className="mt-6">
              <RoomScheduleView 
                roomId={room.id} 
                onTimeSlotSelect={handleTimeSlotSelect}
              />
            </TabsContent>
            
            <TabsContent value="book" className="mt-6">
              <div className="max-w-md mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Book</CardTitle>
                    <CardDescription>
                      {selectedStartTime && selectedEndTime ? (
                        `Selected: ${selectedStartTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${selectedEndTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                      ) : (
                        'Select a time slot from the schedule tab first'
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BookingForm 
                      roomId={room.id}
                      onBookingComplete={() => navigate('/bookings')}
                      preselectedStartTime={selectedStartTime}
                      preselectedEndTime={selectedEndTime}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

const RoomsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [capacityFilter, setCapacityFilter] = useState<string>('all');
  const { data: rooms = [], isLoading, error } = useRooms();
  
  // Set up real-time subscriptions for this page
  useRealtimeSubscription();
  
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           room.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCapacity = capacityFilter === 'all' || 
                           (capacityFilter === 'small' && room.capacity <= 4) ||
                           (capacityFilter === 'medium' && room.capacity > 4 && room.capacity <= 10) ||
                           (capacityFilter === 'large' && room.capacity > 10);
                           
    return matchesSearch && matchesCapacity;
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">Loading rooms...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <h2 className="text-2xl font-bold">Error loading rooms</h2>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Meeting Rooms</h1>
          <p className="text-muted-foreground">
            Browse and book available meeting rooms.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:w-1/2">
            <Input
              placeholder="Search rooms by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full sm:w-1/4">
            <Select value={capacityFilter} onValueChange={setCapacityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by capacity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sizes</SelectItem>
                <SelectItem value="small">Small (1-4)</SelectItem>
                <SelectItem value="medium">Medium (5-10)</SelectItem>
                <SelectItem value="large">Large (10+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-1/4">
            <Button variant="outline" className="w-full" onClick={() => {
              setSearchTerm('');
              setCapacityFilter('all');
            }}>
              Reset Filters
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} isAvailable={true} />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">No rooms match your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

const Rooms = () => {
  const { roomId } = useParams();
  
  return roomId ? <RoomDetail /> : <RoomsList />;
};

export default Rooms;
