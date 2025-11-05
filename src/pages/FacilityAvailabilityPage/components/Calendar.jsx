"use client"

import { useEffect, useMemo, useRef, useCallback, memo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import styles from "../styles/Calendar.module.css"
import {
  formatDate,
  getDaysInMonth,
  getAvailabilityForDate,
  getReservedEventsForDate,
  isPastDate,
} from "../utils/facilityDataHelpers"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const AVAILABILITY_LABELS = {
  fullyAvailable: "Fully available",
  partiallyAvailable: "Partially booked",
  fullyBooked: "Fully reserved",
}

const getAvailabilityLabel = (availability) => AVAILABILITY_LABELS[availability] || "Fully available"

const Calendar = ({ currentDate, selectedDate, selectedFacility, reservations, onDateSelect, onMonthNavigate }) => {
  const selectedDayRef = useRef(null)

  const days = useMemo(() => getDaysInMonth(currentDate), [currentDate])
  const filteredDays = useMemo(() => days.filter(Boolean), [days])

  const dayDataMap = useMemo(() => {
    const map = new Map()

    days.forEach((day) => {
      if (!day) return

      const dateKey = formatDate(day)
      const eventCount = getReservedEventsForDate(reservations, day)
      const availability = getAvailabilityForDate(reservations, selectedFacility, day)
      const past = isPastDate(day)

      map.set(dateKey, {
        eventCount,
        availability,
        past,
        disabled: past,
      })
    })

    return map
  }, [days, reservations, selectedFacility])

  const handleKeyDown = useCallback(
    (e, day) => {
      if (!day) return
      const index = filteredDays.findIndex((d) => formatDate(d) === formatDate(day))
      if (index === -1) return

      const keyMap = {
        ArrowLeft: () => index > 0 && onDateSelect(filteredDays[index - 1]),
        ArrowRight: () => index < filteredDays.length - 1 && onDateSelect(filteredDays[index + 1]),
        ArrowUp: () => index >= 7 && onDateSelect(filteredDays[index - 7]),
        ArrowDown: () => index + 7 < filteredDays.length && onDateSelect(filteredDays[index + 7]),
        Home: () => onDateSelect(filteredDays[0]),
        End: () => onDateSelect(filteredDays[filteredDays.length - 1]),
        PageUp: () => onMonthNavigate(-1),
        PageDown: () => onMonthNavigate(1),
      }

      if (keyMap[e.key]) {
        e.preventDefault()
        keyMap[e.key]()
      }
    },
    [filteredDays, onDateSelect, onMonthNavigate],
  )

  useEffect(() => {
    if (selectedDayRef.current) selectedDayRef.current.focus()
  }, [selectedDate, currentDate])

  const monthYearLabel = useMemo(
    () => currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    [currentDate],
  )

  return (
    <section className={styles.calendarSection}>
      <header className={styles.calendarHeader}>
        <button
          onClick={() => onMonthNavigate(-1)}
          className={styles.navButton}
          aria-label="Previous month"
          type="button"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 id="calendar-heading">{monthYearLabel}</h2>
        <button onClick={() => onMonthNavigate(1)} className={styles.navButton} aria-label="Next month" type="button">
          <ChevronRight size={18} />
        </button>
      </header>

      <div
        className={styles.calendar}
        role="application"
        aria-labelledby="calendar-heading"
        aria-describedby="calendar-instructions"
      >
        <p id="calendar-instructions" className={styles.srOnly}>
          Use arrow keys to navigate. Page Up/Down changes months.
        </p>

        <div className={styles.weekDays} role="row">
          {WEEKDAYS.map((day) => (
            <div key={day} className={styles.weekDay} role="columnheader">
              {day}
            </div>
          ))}
        </div>

        <div className={styles.calendarGrid} role="grid">
          {days.map((day, i) => {
            if (!day) return <div key={i} className={`${styles.calendarDay} ${styles.emptyDay}`} aria-hidden="true" />

            const dateKey = formatDate(day)
            const dayData = dayDataMap.get(dateKey) || {}
            const { eventCount = 0, availability = "fullyAvailable", past = false, disabled = false } = dayData
            const isSelected = dateKey === formatDate(selectedDate)

            return (
              <button
                key={i}
                ref={isSelected ? selectedDayRef : null}
                type="button"
                className={[
                  styles.calendarDay,
                  styles.hasDay,
                  !past && styles[availability],
                  isSelected && styles.selected,
                  past && styles.pastDate,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  if (!disabled) {
                    const pstDateString = day.toLocaleString("en-US", { timeZone: "Asia/Manila" })
                    const pstDate = new Date(pstDateString)
                    pstDate.setHours(12, 0, 0, 0)
                    onDateSelect(pstDate)
                  }
                }}
                onKeyDown={(e) => handleKeyDown(e, day)}
                disabled={disabled}
                aria-label={`${day.toLocaleDateString("en-US", { month: "long", day: "numeric" })}, ${getAvailabilityLabel(availability)}${eventCount ? `, ${eventCount} event${eventCount > 1 ? "s" : ""}` : ""}${past ? ", past date" : ""}`}
                aria-pressed={isSelected}
                aria-disabled={disabled}
                tabIndex={isSelected ? 0 : -1}
                role="gridcell"
              >
                <div className={styles.dayContent}>
                  <span className={styles.dayNumber}>{day.getDate()}</span>
                  {!past && eventCount > 0 && (
                    <div className={styles.eventIndicator}>
                      <span className={styles.eventCount}>{eventCount}</span>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <footer className={styles.legend} role="list" aria-label="Calendar legend">
        {[
          ["fullyAvailable", "Available"],
          ["partiallyAvailable", "Partially Booked"],
          ["fullyBooked", "Fully Reserved"],
        ].map(([key, label]) => (
          <div key={key} className={styles.legendItem} role="listitem">
            <div className={`${styles.legendColor} ${styles[key]}`} />
            <span>{label}</span>
          </div>
        ))}
      </footer>
    </section>
  )
}

export default memo(Calendar)
