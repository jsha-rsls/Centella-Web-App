import { useState, useEffect, useCallback } from "react"
import { Smartphone, Download, AlertCircle } from "lucide-react"
import Skeleton from "react-loading-skeleton"
import 'react-loading-skeleton/dist/skeleton.css'
import styles from "./FacilityAvailabilityPage.module.css"
import Calendar from "./components/Calendar"
import SchedulePanel from "./components/SchedulePanel"
import ReservationModal from "./components/ReservationModal"
import DownloadModal from "./components/DownloadModal"
import { 
  fetchFacilities, 
  fetchFacilityReservations, 
  subscribeToReservations,
  unsubscribeFromReservations 
} from "../../services/facilityService"
import { getDateRange } from "./utils/facilityDataHelpers"

const FacilityAvailabilityPage = () => {
  const [facilities, setFacilities] = useState([])
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [reservations, setReservations] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch facilities on mount
  useEffect(() => {
    const loadFacilities = async () => {
      setLoading(true)
      setError(null)
      
      const { data, error } = await fetchFacilities()
      
      if (error) {
        setError('Failed to load facilities. Please try again.')
        setLoading(false)
        return
      }
      
      if (data && data.length > 0) {
        setFacilities(data)
        setSelectedFacility(data[0].name)
      } else {
        setError('No facilities available.')
      }
      
      setLoading(false)
    }

    loadFacilities()
  }, [])

  // Fetch reservations when facility or month changes
  const loadReservations = useCallback(async () => {
    if (!selectedFacility || facilities.length === 0) return

    const facility = facilities.find(f => f.name === selectedFacility)
    if (!facility) return

    const { startDate, endDate } = getDateRange(currentDate)
    
    console.log('=== FETCHING RESERVATIONS ===')
    console.log('Facility:', facility.name, 'ID:', facility.id)
    console.log('Date range:', startDate, 'to', endDate)
    
    const { data, error } = await fetchFacilityReservations(facility.id, startDate, endDate)
    
    if (error) {
      console.error('Error loading reservations:', error)
      return
    }

    console.log('=== RAW DATA FROM DB ===')
    console.log('Total count:', data?.length || 0)
    if (data && data.length > 0) {
      data.forEach((res, idx) => {
        console.log(`[${idx}]`, {
          id: res.id,
          date: res.reservation_date,
          time: `${res.start_time.substring(0, 5)} - ${res.end_time.substring(0, 5)}`,
          facility_id: res.facility_id,
          purpose: res.purpose
        })
      })
    }

    setReservations(data || [])
  }, [selectedFacility, currentDate, facilities])

  useEffect(() => {
    loadReservations()
  }, [loadReservations])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!selectedFacility || facilities.length === 0) return

    const facility = facilities.find(f => f.name === selectedFacility)
    if (!facility) return

    const { startDate, endDate } = getDateRange(currentDate)
    
    const channel = subscribeToReservations(
      facility.id, 
      startDate, 
      endDate, 
      (updatedReservations) => {
        console.log('Real-time update received:', updatedReservations)
        setReservations(updatedReservations || [])
      }
    )

    return () => {
      unsubscribeFromReservations(channel)
    }
  }, [selectedFacility, currentDate, facilities])

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const handleFacilityChange = (facilityName) => {
    setSelectedFacility(facilityName)
  }

  const handleDateSelect = (dateObj) => {
    // Convert to Philippine Standard Time (GMT+8)
    const pstDateString = dateObj.toLocaleString('en-US', { timeZone: 'Asia/Manila' })
    const pstDate = new Date(pstDateString)
    pstDate.setHours(12, 0, 0, 0)
    
    const year = pstDate.getFullYear()
    const month = String(pstDate.getMonth() + 1).padStart(2, '0')
    const day = String(pstDate.getDate()).padStart(2, '0')
    const isoDate = `${year}-${month}-${day}`
    
    console.log('Date selected from calendar (PST):', {
      selected: isoDate,
      raw: dateObj,
      pst: pstDate
    })
    setSelectedDate(pstDate)
  }

  const handleReserveClick = (slot) => {
    setSelectedSlot(slot)
    setShowModal(true)
  }

  const handleDownloadClick = () => {
    setShowDownloadModal(true)
  }

  if (loading) {
    return (
      <div className={styles.facilityPage}>
        <div className={styles.container}>
          <div className={styles.header}>
            <Skeleton height={36} width={250} style={{ marginBottom: '0.4rem' }} />
            <Skeleton height={20} width={200} style={{ marginBottom: '0.8rem' }} />
            <div className={styles.notice}>
              <div className={styles.noticeContent}>
                <Skeleton circle width={18} height={18} style={{ marginRight: '8px' }} />
                <Skeleton width={200} height={16} />
              </div>
              <Skeleton height={36} width={120} style={{ borderRadius: '8px' }} />
            </div>
          </div>
          <div className={styles.facilitySelector}>
            <Skeleton height={24} width={150} style={{ marginBottom: '0.5rem' }} />
            <div className={styles.facilityButtons}>
              <Skeleton height={40} width={100} style={{ marginRight: '0.6rem' }} />
              <Skeleton height={40} width={100} style={{ marginRight: '0.6rem' }} />
              <Skeleton height={40} width={100} />
            </div>
          </div>
          <div className={styles.mainContent}>
            <Skeleton height={300} style={{ marginBottom: '1rem', borderRadius: '0.75rem' }} />
            <Skeleton height={300} />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.facilityPage}>
        <div className={styles.container}>
          <div className={styles.errorState}>
            <AlertCircle size={48} className={styles.errorIcon} />
            <h3>Error Loading Facilities</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.facilityPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Facility Availability</h1>
          <p>Check the availability of community facilities</p>
          <div className={styles.notice}>
            <div className={styles.noticeContent}>
              <Smartphone size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "8px" }} />
              <span>
                <strong>Note:</strong> To book facilities, please use our mobile app
              </span>
            </div>
            <button className={styles.downloadButton} onClick={handleDownloadClick}>
              <Download size={16} />
              Download App
            </button>
          </div>
        </div>

        {facilities.length > 0 && (
          <>
            <div className={styles.facilitySelector}>
              <h3>Select Facility:</h3>
              <div className={styles.facilityButtons}>
                {facilities.map((facility) => (
                  <button
                    key={facility.id}
                    onClick={() => handleFacilityChange(facility.name)}
                    className={`${styles.facilityButton} ${selectedFacility === facility.name ? styles.active : ""}`}
                  >
                    {facility.name}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.mainContent}>
              <Calendar
                currentDate={currentDate}
                selectedDate={selectedDate}
                selectedFacility={selectedFacility}
                reservations={reservations}
                onDateSelect={setSelectedDate}
                onMonthNavigate={navigateMonth}
              />
              <SchedulePanel
                selectedDate={selectedDate}
                selectedFacility={selectedFacility}
                reservations={reservations}
                onReserveClick={handleReserveClick}
              />
            </div>
          </>
        )}
      </div>

      <ReservationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedFacility={selectedFacility}
        selectedSlot={selectedSlot}
      />

      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </div>
  )
}

export default FacilityAvailabilityPage