// src/utils/facilityDataHelpers.js

/**
 * Format date to YYYY-MM-DD using Philippine Standard Time (GMT+8)
 */
export const formatDate = (date) => {
  // Create date in PST timezone (GMT+8)
  const pstDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Manila' }))
  const year = pstDate.getFullYear()
  const month = String(pstDate.getMonth() + 1).padStart(2, '0')
  const day = String(pstDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format time from HH:MM:SS to HH:MM
 */
export const formatTime = (timeString) => {
  if (!timeString) return ''
  return timeString.substring(0, 5)
}

/**
 * Convert 24-hour time to 12-hour format with AM/PM (Philippine style)
 * Input: "HH:MM"
 */
export const convertTo12Hour = (time24) => {
  if (!time24) return ''
  const [hours, minutes] = time24.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${hour12}:${minutes} ${ampm}`
}

/**
 * Format time range to 12-hour format
 */
export const formatTimeRange = (startTime, endTime) => {
  const start = formatTime(startTime)
  const end = formatTime(endTime)
  return `${convertTo12Hour(start)} - ${convertTo12Hour(end)}`
}

/**
 * Generate hourly time slots from 7 AM to 11 PM
 */
export const generateAllTimeSlots = () => {
  const slots = []
  for (let hour = 7; hour < 23; hour++) {
    const startTime = `${hour.toString().padStart(2, '0')}:00:00`
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00:00`
    slots.push({ startTime, endTime })
  }
  return slots
}

/**
 * Get days in month for calendar display
 */
export const getDaysInMonth = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days = []

  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day))
  }

  return days
}

/**
 * Check if a date is in the past
 */
export const isPastDate = (day) => {
  if (!day) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const compare = new Date(day)
  compare.setHours(0, 0, 0, 0)
  return compare < today
}

/**
 * Check if two time ranges overlap
 * Both times should be in HH:MM:SS format
 */
const doTimesOverlap = (slot1Start, slot1End, slot2Start, slot2End) => {
  return slot1Start < slot2End && slot1End > slot2Start
}

/**
 * Get availability status for a specific date
 * FIXED: Now handles custom time ranges (not just hourly slots)
 */
export const getAvailabilityForDate = (rawReservations, selectedFacility, date) => {
  const dateStr = formatDate(date)
  
  // Filter reservations for this exact date
  const dayReservations = rawReservations.filter(r => r.reservation_date === dateStr)
  
  if (dayReservations.length === 0) {
    return 'fullyAvailable'
  }

  // Generate standard hourly slots (7 AM to 11 PM = 16 slots)
  const allSlots = generateAllTimeSlots()
  let fullyReservedHours = 0

  // Check each hourly slot against ALL reservations
  allSlots.forEach(slot => {
    const isSlotReserved = dayReservations.some(res => 
      doTimesOverlap(slot.startTime, slot.endTime, res.start_time, res.end_time)
    )
    if (isSlotReserved) fullyReservedHours++
  })

  if (fullyReservedHours === 0) return 'fullyAvailable'
  if (fullyReservedHours === allSlots.length) return 'fullyBooked'
  return 'partiallyAvailable'
}

/**
 * Get count of reservations for a date
 */
export const getReservedEventsForDate = (rawReservations, date) => {
  const dateStr = formatDate(date)
  return rawReservations.filter(r => r.reservation_date === dateStr).length
}

/**
 * Group consecutive reserved slots (handles custom durations like 9:00-11:30)
 */
const groupConsecutiveReservations = (allSlots) => {
  if (allSlots.length === 0) return []
  
  const grouped = []
  let currentGroup = null

  allSlots.forEach((slot, index) => {
    if (slot.status === 'Reserved') {
      // Start new group or extend existing
      if (!currentGroup || currentGroup.reservationId !== slot.reservationId) {
        if (currentGroup) {
          grouped.push(currentGroup)
        }
        currentGroup = {
          time: slot.time,
          status: 'Reserved',
          event: slot.event,
          userName: slot.userName,
          reservationId: slot.reservationId,
          rawStart: slot.rawStart,
          rawEnd: slot.rawEnd
        }
      } else if (currentGroup && currentGroup.reservationId === slot.reservationId) {
        // Extend the current group's end time
        currentGroup.rawEnd = slot.rawEnd
        currentGroup.time = formatTimeRange(currentGroup.rawStart, slot.rawEnd)
      }
    } else {
      // Available slot - close current group
      if (currentGroup) {
        grouped.push(currentGroup)
        currentGroup = null
      }
      grouped.push(slot)
    }
  })

  // Don't forget the last group
  if (currentGroup) {
    grouped.push(currentGroup)
  }

  return grouped
}

/**
 * Get complete schedule for a selected date
 * Shows ACTUAL reservation times (9:00-11:30, not just hourly slots)
 * Groups consecutive reserved slots into single blocks
 */
export const getSelectedDateSchedule = (rawReservations, selectedDate) => {
  const dateStr = formatDate(selectedDate)
  
  // Get ONLY reservations for this exact date
  const dayReservations = rawReservations.filter(r => r.reservation_date === dateStr)
  
  console.log('Building schedule for:', { dateStr, reservationCount: dayReservations.length })
  
  const allSlots = generateAllTimeSlots()

  // Map each standard hourly slot to show if it overlaps with reservations
  const allSlots_with_status = allSlots.map(slot => {
    const overlappingRes = dayReservations.find(res => 
      doTimesOverlap(slot.startTime, slot.endTime, res.start_time, res.end_time)
    )
    
    if (overlappingRes) {
      return {
        time: formatTimeRange(slot.startTime, slot.endTime),
        status: 'Reserved',
        event: overlappingRes.purpose || 'Reserved',
        userName: overlappingRes.residents 
          ? `${overlappingRes.residents.first_name} ${overlappingRes.residents.last_name}`
          : 'Unknown',
        reservationId: overlappingRes.id,
        rawStart: slot.startTime,
        rawEnd: slot.endTime
      }
    }
    
    return {
      time: formatTimeRange(slot.startTime, slot.endTime),
      status: 'Available',
      event: null,
      userName: null,
      reservationId: null,
      rawStart: slot.startTime,
      rawEnd: slot.endTime
    }
  })

  // Group consecutive reserved slots to avoid duplication
  const groupedSlots = groupConsecutiveReservations(allSlots_with_status)

  // Build events array from actual reservations (with real times like 9:00-11:30)
  const events = []
  dayReservations.forEach(res => {
    events.push({
      time: formatTimeRange(res.start_time, res.end_time),
      event: res.purpose || 'Reserved',
      userName: res.residents 
        ? `${res.residents.first_name} ${res.residents.last_name}`
        : 'Unknown',
      status: 'Reserved',
      reservationId: res.id
    })
  })

  return {
    status: events.length === 0 ? 'available' : 'reserved',
    events: events,
    allSlots: groupedSlots
  }
}

/**
 * Get date range for a month
 */
export const getDateRange = (currentDate) => {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  }
}