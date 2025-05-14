
import React from 'react';
import { Link } from 'react-router-dom';
import { Room } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RoomCardProps {
  room: Room;
  isAvailable?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, isAvailable = true }) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={room.image} 
          alt={room.name} 
          className="object-cover w-full h-full transition-transform hover:scale-105 duration-300"
        />
        <div className="absolute top-2 right-2">
          <Badge className={isAvailable ? 'status-available' : 'status-booked'}>
            {isAvailable ? 'Available' : 'Booked'}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{room.name}</CardTitle>
          <Badge variant="outline">{room.capacity} people</Badge>
        </div>
        <CardDescription>{room.location}</CardDescription>
      </CardHeader>
      <CardContent className="pb-4 flex-grow">
        <p className="text-sm text-muted-foreground mb-2">{room.description}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {room.amenities.map((amenity, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {amenity}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild className="w-full">
          <Link to={`/rooms/${room.id}`}>
            {isAvailable ? 'Book Now' : 'View Details'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
