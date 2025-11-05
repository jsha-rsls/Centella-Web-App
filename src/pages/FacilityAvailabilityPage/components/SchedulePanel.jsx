import { memo, useMemo, useCallback } from "react"
import { Calendar as CalendarIcon, Lock, CheckCircle2, Clock, TrendingUp, CalendarPlus } from "lucide-react"
import styles from "../styles/SchedulePanel.module.css"
import { getSelectedDateSchedule, formatDate } from "../utils/facilityDataHelpers"

const getStatusIcon = (status) => {
  return status === "Reserved" ? (
    <Lock size={16} className={styles.iconReserved} />
  ) : (
    <CheckCircle2 size={16} className={styles.iconAvailable} />
  )
}

const getStatusLabel = (status) => {
  return status === "Reserved" ? "Reserved" : "Available"
}

const SchedulePanel = ({ selectedDate, selectedFacility, reservations, onReserveClick }) => {
  // Get schedule for selected date
  const schedule = useMemo(() => {
    const result = getSelectedDateSchedule(reservations, selectedDate)
    console.log('Schedule for', formatDate(selectedDate), ':', result)
    return result
  }, [reservations, selectedDate])

  // Check if today
  const isToday = useMemo(
    () => formatDate(new Date()) === formatDate(selectedDate),
    [selectedDate]
  )

  // Calculate stats
  const stats = useMemo(() => {
    if (!schedule.allSlots || schedule.allSlots.length === 0) return null

    const totalSlots = schedule.allSlots.length
    const reservedSlots = schedule.allSlots.filter(s => s.status === 'Reserved').length
    const availableSlots = totalSlots - reservedSlots

    return { totalSlots, reservedSlots, availableSlots }
  }, [schedule])

  const formattedDate = useMemo(
    () => selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    [selectedDate]
  )

  const statsAriaLabel = useMemo(() => {
    if (!stats) return ""
    return `${stats.availableSlots} of ${stats.totalSlots} time slots available`
  }, [stats])

  const handleReserveClick = useCallback(
    (slot) => {
      onReserveClick(slot)
    },
    [onReserveClick]
  )

  return (
    <div className={styles.scheduleSection}>
      <div className={styles.selectedDateHeader}>
        <div className={styles.dateInfo}>
          <div className={styles.dateTitle}>
            <CalendarIcon size={20} className={styles.calendarIcon} />
            <h3>{formattedDate}</h3>
            {isToday && (
              <span className={styles.todayBadge} role="status" aria-label="Selected date is today">
                Today
              </span>
            )}
          </div>
          <p className={styles.facilityName} aria-label={`Facility: ${selectedFacility}`}>
            {selectedFacility}
          </p>
        </div>

        {stats && (
          <div className={styles.statsGrid} role="status" aria-label={statsAriaLabel}>
            <div className={styles.statCard}>
              <CheckCircle2 size={18} className={styles.statIconAvailable} />
              <div className={styles.statContent}>
                <span className={styles.statNumber}>{stats.availableSlots}</span>
                <span className={styles.statLabel}>Available</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <Lock size={18} className={styles.statIconReserved} />
              <div className={styles.statContent}>
                <span className={styles.statNumber}>{stats.reservedSlots}</span>
                <span className={styles.statLabel}>Reserved</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <TrendingUp size={18} className={styles.statIconTotal} />
              <div className={styles.statContent}>
                <span className={styles.statNumber}>{stats.totalSlots}</span>
                <span className={styles.statLabel}>Total</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.selectedDateContent} role="region" aria-label="Schedule details">
        {schedule.status === "available" && (
          <div className={styles.availableDay}>
            <div className={styles.statusBadge} role="status">
              <span className={styles.availableBadge}>
                <CheckCircle2 size={18} style={{ display: "inline", verticalAlign: "middle" }} /> Fully Available
              </span>
            </div>
            <p>All time slots are open for booking!</p>
            <div className={styles.timelineView} role="list" aria-label="Available time slots">
              {schedule.allSlots.map((slot, index) => (
                <div key={index} className={styles.slotRow}>
                  <div className={`${styles.timeCard} ${styles.timeCardAvailable}`} role="listitem">
                    <div className={styles.timeCardTime}>
                      <Clock size={14} />
                      <span>{slot.time}</span>
                    </div>
                    <div className={styles.timeCardStatus}>
                      {getStatusIcon("Available")}
                      <span>Available</span>
                    </div>
                  </div>
                  <button
                    className={styles.reserveIconButton}
                    onClick={() => handleReserveClick(slot)}
                    aria-label={`Reserve time slot ${slot.time}`}
                    title="Reserve this slot"
                  >
                    <CalendarPlus size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {schedule.status === "reserved" && (
          <div className={styles.reservedDay}>
            <div className={styles.timelineView} role="list" aria-label="Time slot schedule">
              {schedule.allSlots.map((slot, index) => {
                const isReserved = slot.status === "Reserved"
                const statusLabel = getStatusLabel(slot.status)
                const eventName = isReserved && slot.event ? slot.event : statusLabel

                return (
                  <div key={index} className={styles.slotRow}>
                    <div
                      className={`${styles.timeCard} ${isReserved ? styles.timeCardReserved : styles.timeCardAvailable}`}
                      role="listitem"
                    >
                      <div className={styles.timeCardTime}>
                        <Clock size={14} />
                        <span>{slot.time}</span>
                      </div>
                      <div className={styles.timeCardStatus}>
                        {getStatusIcon(slot.status)}
                        <span>{eventName}</span>
                      </div>
                    </div>
                    {!isReserved && (
                      <button
                        className={styles.reserveIconButton}
                        onClick={() => handleReserveClick(slot)}
                        aria-label={`Reserve time slot ${slot.time}`}
                        title="Reserve this slot"
                      >
                        <CalendarPlus size={18} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(SchedulePanel)