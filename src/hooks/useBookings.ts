
import { useQuery } from '@tanstack/react-query'
import { getBookings, getRoomBookings, getTodayBookings } from '@/lib/database'

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: getBookings,
  })
}

export function useRoomBookings(roomId: string) {
  return useQuery({
    queryKey: ['bookings', 'room', roomId],
    queryFn: () => getRoomBookings(roomId),
    enabled: !!roomId,
  })
}

export function useTodayBookings() {
  return useQuery({
    queryKey: ['bookings', 'today'],
    queryFn: getTodayBookings,
  })
}
