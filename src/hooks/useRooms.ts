
import { useQuery } from '@tanstack/react-query'
import { getRooms, getRoomById } from '@/lib/database'

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
  })
}

export function useRoom(roomId: string) {
  return useQuery({
    queryKey: ['room', roomId],
    queryFn: () => getRoomById(roomId),
    enabled: !!roomId,
  })
}
