// src/services/facilityService.js
import supabase from '../utils/supabase'

/**
 * Fetch all facilities from the database
 */
export const fetchFacilities = async () => {
  try {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching facilities:', error)
    return { data: null, error }
  }
}

/**
 * Fetch reservations for a specific facility within a date range
 * Returns raw data directly - no transformation
 */
export const fetchFacilityReservations = async (facilityId, startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id,
        facility_id,
        reservation_date,
        start_time,
        end_time,
        purpose,
        status,
        residents:user_id (
          first_name,
          last_name
        )
      `)
      .eq('facility_id', facilityId)
      .gte('reservation_date', startDate)
      .lte('reservation_date', endDate)
      .in('status', ['pending', 'confirmed'])
      .order('reservation_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) throw error
    
    console.log('Raw DB Query:', {
      facilityId,
      startDate,
      endDate,
      returned_count: data?.length || 0,
    })
    
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return { data: null, error }
  }
}

/**
 * Subscribe to real-time changes in reservations for a facility
 */
export const subscribeToReservations = (facilityId, startDate, endDate, callback) => {
  const channel = supabase
    .channel(`reservations-${facilityId}-${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reservations',
        filter: `facility_id=eq.${facilityId}`
      },
      async (payload) => {
        console.log('Real-time change detected:', payload)
        
        // Refetch all data to get the source of truth
        const { data } = await fetchFacilityReservations(facilityId, startDate, endDate)
        callback(data || [])
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status)
    })

  return channel
}

/**
 * Unsubscribe from real-time changes
 */
export const unsubscribeFromReservations = (channel) => {
  if (channel) {
    supabase.removeChannel(channel)
  }
}

/**
 * Check if a time slot is available
 */
export const checkSlotAvailability = async (facilityId, date, startTime, endTime) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('id, start_time, end_time')
      .eq('facility_id', facilityId)
      .eq('reservation_date', date)
      .in('status', ['pending', 'confirmed'])
      .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`)

    if (error) throw error
    return { available: data.length === 0, conflictingReservations: data }
  } catch (error) {
    console.error('Error checking slot availability:', error)
    return { available: false, error }
  }
}