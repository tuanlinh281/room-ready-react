
export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string;
  amenities: string[];
  image: string;
  description: string;
}

export interface Booking {
  id: string;
  roomId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  bookedBy: string;
  attendees: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

// Mock rooms data
export const rooms: Room[] = [
  {
    id: "room-1",
    name: "Conference Room A",
    capacity: 12,
    location: "1st Floor, East Wing",
    amenities: ["Projector", "Whiteboard", "Video Conference System"],
    image: "https://images.unsplash.com/photo-1571624436279-b272aff752b5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    description: "Large conference room ideal for team meetings and presentations."
  },
  {
    id: "room-2",
    name: "Boardroom",
    capacity: 8,
    location: "2nd Floor, West Wing",
    amenities: ["Smart TV", "Whiteboard", "Conference Phone"],
    image: "https://images.unsplash.com/photo-1505409859467-3a796fd5798e?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    description: "Executive meeting room with premium furnishings and equipment."
  },
  {
    id: "room-3",
    name: "Huddle Room 1",
    capacity: 4,
    location: "1st Floor, North Wing",
    amenities: ["TV Screen", "Whiteboard"],
    image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    description: "Small meeting space for quick brainstorming sessions."
  },
  {
    id: "room-4",
    name: "Training Room",
    capacity: 20,
    location: "Ground Floor, South Wing",
    amenities: ["Projector", "Multiple Whiteboards", "Audio System", "Laptop Connectors"],
    image: "https://images.unsplash.com/photo-1577412647305-991150c7d163?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    description: "Large space configured for training sessions and workshops."
  }
];

// Generate today's date and upcoming dates for bookings
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

// Mock bookings data
export const bookings: Booking[] = [
  {
    id: "booking-1",
    roomId: "room-1",
    title: "Weekly Team Sync",
    startTime: new Date(today.setHours(10, 0, 0, 0)),
    endTime: new Date(today.setHours(11, 0, 0, 0)),
    bookedBy: "Jane Smith",
    attendees: 8,
    status: "confirmed"
  },
  {
    id: "booking-2",
    roomId: "room-2",
    title: "Client Meeting",
    startTime: new Date(tomorrow.setHours(14, 0, 0, 0)),
    endTime: new Date(tomorrow.setHours(15, 30, 0, 0)),
    bookedBy: "John Doe",
    attendees: 5,
    status: "confirmed"
  },
  {
    id: "booking-3",
    roomId: "room-3",
    title: "Project Kickoff",
    startTime: new Date(nextWeek.setHours(9, 0, 0, 0)),
    endTime: new Date(nextWeek.setHours(10, 0, 0, 0)),
    bookedBy: "Sarah Johnson",
    attendees: 4,
    status: "pending"
  }
];

// Helper function to check if a room is available at a specific time
export function isRoomAvailable(roomId: string, date: Date, startTime: Date, endTime: Date): boolean {
  // Filter bookings for the specific room and check if there's any overlap
  const roomBookings = bookings.filter(booking => booking.roomId === roomId);
  
  // Set the hours and minutes from startTime and endTime to the date parameter
  const startDateTime = new Date(date);
  startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
  
  const endDateTime = new Date(date);
  endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
  
  // Check for overlapping bookings
  return !roomBookings.some(booking => {
    return (
      (startDateTime >= booking.startTime && startDateTime < booking.endTime) ||
      (endDateTime > booking.startTime && endDateTime <= booking.endTime) ||
      (startDateTime <= booking.startTime && endDateTime >= booking.endTime)
    );
  });
}

// Helper function to get all bookings for a specific room
export function getRoomBookings(roomId: string): Booking[] {
  return bookings.filter(booking => booking.roomId === roomId);
}

// Helper function to get all bookings for today
export function getTodayBookings(): Booking[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return bookings.filter(booking => 
    booking.startTime >= today && booking.startTime < tomorrow
  );
}

// Helper function to add a new booking
export function addBooking(booking: Omit<Booking, 'id'>): Booking {
  const newBooking = {
    ...booking,
    id: `booking-${bookings.length + 1}`
  };
  bookings.push(newBooking);
  return newBooking;
}
