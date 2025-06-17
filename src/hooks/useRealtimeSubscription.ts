
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useRealtimeSubscription() {
  const queryClient = useQueryClient()

  useEffect(() => {
    console.log('Setting up real-time subscription for bookings...')
    
    // Subscribe to changes in the bookings table
    const bookingsSubscription = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Real-time booking change detected:', payload)
          
          // Invalidate and refetch all booking-related queries
          queryClient.invalidateQueries({ queryKey: ['bookings'] })
          queryClient.invalidateQueries({ queryKey: ['bookings', 'today'] })
          
          // If it's a specific room booking, invalidate that room's bookings too
          if (payload.new && payload.new.room_id) {
            queryClient.invalidateQueries({ 
              queryKey: ['bookings', 'room', payload.new.room_id] 
            })
          }
          if (payload.old && payload.old.room_id) {
            queryClient.invalidateQueries({ 
              queryKey: ['bookings', 'room', payload.old.room_id] 
            })
          }
        }
      )
      .subscribe((status) => {
        console.log('Bookings subscription status:', status)
      })

    // Subscribe to changes in the rooms table (if rooms get updated)
    const roomsSubscription = supabase
      .channel('rooms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public', 
          table: 'rooms'
        },
        (payload) => {
          console.log('Real-time room change detected:', payload)
          
          // Invalidate room queries
          queryClient.invalidateQueries({ queryKey: ['rooms'] })
          
          if (payload.new && payload.new.id) {
            queryClient.invalidateQueries({ 
              queryKey: ['room', payload.new.id] 
            })
          }
          if (payload.old && payload.old.id) {
            queryClient.invalidateQueries({ 
              queryKey: ['room', payload.old.id] 
            })
          }
        }
      )
      .subscribe((status) => {
        console.log('Rooms subscription status:', status)
      })

    // Cleanup subscriptions on unmount
    return () => {
      console.log('Cleaning up real-time subscriptions...')
      supabase.removeChannel(bookingsSubscription)
      supabase.removeChannel(roomsSubscription)
    }
  }, [queryClient])
}
