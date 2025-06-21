
import { supabase } from './supabase'
import { Room, Booking } from './data'

export interface DatabaseRoom {
  id: string
  name: string
  capacity: number
  location: string
  amenities: string[]
  image: string
  description: string
  created_at?: string
  updated_at?: string
}

export interface DatabaseBooking {
  id: string
  room_id: string
  title: string
  start_time: string
  end_time: string
  booked_by: string
  attendees: number
  status: 'confirmed' | 'pending' | 'cancelled'
  created_at?: string
  updated_at?: string
}

// Room functions
export async function getRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching rooms:', error)
    throw error
  }

  return data?.map(room => ({
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    location: room.location,
    amenities: room.amenities || [],
    image: room.image,
    description: room.description
  })) || []
}

export async function getRoomById(id: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching room:', error)
    return null
  }

  return data ? {
    id: data.id,
    name: data.name,
    capacity: data.capacity,
    location: data.location,
    amenities: data.amenities || [],
    image: data.image,
    description: data.description
  } : null
}

// Booking functions
export async function getBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('start_time')

  if (error) {
    console.error('Error fetching bookings:', error)
    throw error
  }

  return data?.map(booking => ({
    id: booking.id,
    roomId: booking.room_id,
    title: booking.title,
    startTime: new Date(booking.start_time),
    endTime: new Date(booking.end_time),
    bookedBy: booking.booked_by,
    attendees: booking.attendees,
    status: booking.status
  })) || []
}

export async function getRoomBookings(roomId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('room_id', roomId)
    .order('start_time')

  if (error) {
    console.error('Error fetching room bookings:', error)
    throw error
  }

  return data?.map(booking => ({
    id: booking.id,
    roomId: booking.room_id,
    title: booking.title,
    startTime: new Date(booking.start_time),
    endTime: new Date(booking.end_time),
    bookedBy: booking.booked_by,
    attendees: booking.attendees,
    status: booking.status
  })) || []
}

export async function getTodayBookings(): Promise<Booking[]> {
  const today = new Date()
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString()
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString()

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .gte('start_time', startOfDay)
    .lte('start_time', endOfDay)
    .order('start_time')

  if (error) {
    console.error('Error fetching today bookings:', error)
    throw error
  }

  return data?.map(booking => ({
    id: booking.id,
    roomId: booking.room_id,
    title: booking.title,
    startTime: new Date(booking.start_time),
    endTime: new Date(booking.end_time),
    bookedBy: booking.booked_by,
    attendees: booking.attendees,
    status: booking.status
  })) || []
}

export async function createBooking(booking: {
  roomId: string
  title: string
  startTime: Date
  endTime: Date
  bookedBy: string
  attendees: number
}): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      room_id: booking.roomId,
      title: booking.title,
      start_time: booking.startTime.toISOString(),
      end_time: booking.endTime.toISOString(),
      booked_by: booking.bookedBy,
      attendees: booking.attendees,
      status: 'confirmed'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating booking:', error)
    throw error
  }

  return {
    id: data.id,
    roomId: data.room_id,
    title: data.title,
    startTime: new Date(data.start_time),
    endTime: new Date(data.end_time),
    bookedBy: data.booked_by,
    attendees: data.attendees,
    status: data.status
  }
}

export async function isRoomAvailable(
  roomId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  console.log('Checking availability for room:', roomId, 'from', startTime, 'to', endTime)
  
  // Query for overlapping bookings - a booking overlaps if:
  // 1. It starts before our end time AND ends after our start time
  const { data, error } = await supabase
    .from('bookings')
    .select('id, start_time, end_time')
    .eq('room_id', roomId)
    .eq('status', 'confirmed')
    .lt('start_time', endTime.toISOString())
    .gt('end_time', startTime.toISOString())

  if (error) {
    console.error('Error checking room availability:', error)
    return false
  }

  console.log('Found overlapping bookings:', data?.length || 0)
  return data.length === 0
}

export async function getRoomAvailabilityForDay(
  roomId: string,
  date: Date
): Promise<{ hour: number; isAvailable: boolean; booking?: Booking }[]> {
  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('room_id', roomId)
    .eq('status', 'confirmed')
    .gte('start_time', dayStart.toISOString())
    .lte('end_time', dayEnd.toISOString())
    .order('start_time')

  if (error) {
    console.error('Error fetching room availability:', error)
    throw error
  }

  const bookings = data?.map(booking => ({
    id: booking.id,
    roomId: booking.room_id,
    title: booking.title,
    startTime: new Date(booking.start_time),
    endTime: new Date(booking.end_time),
    bookedBy: booking.booked_by,
    attendees: booking.attendees,
    status: booking.status
  })) || []

  // Generate hourly slots (8 AM to 6 PM)
  const availability = []
  for (let hour = 8; hour < 18; hour++) {
    const slotStart = new Date(date)
    slotStart.setHours(hour, 0, 0, 0)
    const slotEnd = new Date(date)
    slotEnd.setHours(hour + 1, 0, 0, 0)

    // Check if any booking overlaps with this hour slot
    const booking = bookings.find(b => 
      b.startTime < slotEnd && b.endTime > slotStart
    )

    availability.push({
      hour,
      isAvailable: !booking,
      booking
    })
  }

  return availability
}

export async function isRoomFullyBookedForDay(
  roomId: string, 
  date: Date
): Promise<boolean> {
  const availability = await getRoomAvailabilityForDay(roomId, date)
  return availability.every(slot => !slot.isAvailable)
}

export async function updateBooking(
  bookingId: string,
  updates: {
    title?: string
    startTime?: Date
    endTime?: Date
    attendees?: number
  }
): Promise<Booking> {
  const updateData: any = {}
  
  if (updates.title) updateData.title = updates.title
  if (updates.startTime) updateData.start_time = updates.startTime.toISOString()
  if (updates.endTime) updateData.end_time = updates.endTime.toISOString()
  if (updates.attendees) updateData.attendees = updates.attendees

  const { data, error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId)
    .select()
    .single()

  if (error) {
    console.error('Error updating booking:', error)
    throw error
  }

  return {
    id: data.id,
    roomId: data.room_id,
    title: data.title,
    startTime: new Date(data.start_time),
    endTime: new Date(data.end_time),
    bookedBy: data.booked_by,
    attendees: data.attendees,
    status: data.status
  }
}

export async function deleteBooking(bookingId: string): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId)

  if (error) {
    console.error('Error deleting booking:', error)
    throw error
  }
}
