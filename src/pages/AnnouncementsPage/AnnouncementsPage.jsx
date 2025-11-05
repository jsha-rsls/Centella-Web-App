import { useState, useCallback, useMemo } from "react"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import AnnouncementsHeader from "./components/AnnouncementsHeader"
import AnnouncementsFilters from "./components/AnnouncementsFilters"
import AnnouncementsList from "./components/AnnouncementsList"
import AnnouncementModal from "./components/AnnouncementModal"
import Pagination from "./components/Pagination"
import { usePaginatedAnnouncements } from "./hooks/usePaginatedAnnouncements"
import { incrementAnnouncementViews } from "../../services/announcementsService"
import styles from "./AnnouncementsPage.module.css"

// Extract skeleton component
const SkeletonLoader = ({ viewMode }) => {
  const skeletonItems = useMemo(() => Array(6).fill(null), [])
  
  return (
    <>
      <div style={{ marginBottom: "2rem" }}>
        <Skeleton height={56} borderRadius={12} style={{ marginBottom: "1.5rem" }} />
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Skeleton width={150} height={44} borderRadius={8} />
          <Skeleton width={150} height={44} borderRadius={8} />
          <Skeleton width={150} height={44} borderRadius={8} />
          <Skeleton width={100} height={44} borderRadius={8} style={{ marginLeft: "auto" }} />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(320px, 1fr))" : "1fr",
          gap: "1.5rem",
          marginTop: "2rem",
        }}
      >
        {skeletonItems.map((_, i) => (
          <div
            key={i}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <Skeleton height={24} width="40%" style={{ marginBottom: "0.75rem" }} />
            <Skeleton height={28} style={{ marginBottom: "1rem" }} />
            <Skeleton count={3} style={{ marginBottom: "0.5rem" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
              <Skeleton width={80} height={20} />
              <Skeleton width={60} height={20} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

const AnnouncementsPage = () => {
  const [viewMode, setViewMode] = useState("grid")
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)

  // Use the new paginated hook with 12 items per page
  const {
    announcements,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    updateFilters,
    filters
  } = usePaginatedAnnouncements(12)

  // Derive selected month from filters
  const selectedMonth = useMemo(() => {
    if (!filters.startDate || !filters.endDate) return "All"
    
    const startDate = new Date(filters.startDate)
    const endDate = new Date(filters.endDate)
    
    // Check if it's a full month range
    const isFirstDay = startDate.getDate() === 1
    const isLastDay = endDate.getDate() === new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate()
    
    if (isFirstDay && isLastDay && startDate.getMonth() === endDate.getMonth()) {
      return startDate.toLocaleString("en-US", { month: "long" })
    }
    
    return "All"
  }, [filters.startDate, filters.endDate])

  // Derive selected year from filters
  const selectedYear = useMemo(() => {
    if (filters.year) return filters.year.toString()
    if (filters.startDate) {
      return new Date(filters.startDate).getFullYear().toString()
    }
    return "All"
  }, [filters.year, filters.startDate])

  // Handle "This Week" filter
  const handleThisWeekToggle = useCallback(() => {
    if (filters.isThisWeek) {
      // Turn off "This Week" filter
      updateFilters({ 
        startDate: null, 
        endDate: null,
        year: null,
        isThisWeek: false
      })
    } else {
      // Turn on "This Week" filter
      const now = new Date()
      const dayOfWeek = now.getDay()
      
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - dayOfWeek)
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(now)
      endOfWeek.setDate(now.getDate() + (6 - dayOfWeek))
      endOfWeek.setHours(23, 59, 59, 999)

      updateFilters({ 
        startDate: startOfWeek.toISOString(),
        endDate: endOfWeek.toISOString(),
        category: 'All',
        year: null,
        isThisWeek: true
      })
    }
  }, [filters.isThisWeek, updateFilters])

  // Check if "This Week" filter is active
  const isThisWeekActive = useMemo(() => {
    return filters.isThisWeek === true
  }, [filters.isThisWeek])

  // Handle month change
  const handleMonthChange = useCallback((month) => {
    if (month === "All") {
      updateFilters({ 
        startDate: null,
        endDate: null,
        isThisWeek: false
      })
    } else {
      // Calculate start and end of the month
      const year = filters.year || selectedYear !== "All" ? parseInt(selectedYear) : new Date().getFullYear()
      const monthIndex = new Date(Date.parse(month + " 1, " + year)).getMonth()
      
      const startDate = new Date(year, monthIndex, 1)
      const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999)
      
      updateFilters({ 
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        year: year,
        isThisWeek: false  // Deactivate "This Week" when selecting a month
      })
    }
  }, [filters.year, selectedYear, updateFilters])

  // Handle year change
  const handleYearChange = useCallback((year) => {
    if (year === "All") {
      updateFilters({ 
        year: null,
        startDate: null,
        endDate: null,
        isThisWeek: false
      })
    } else {
      const yearNum = parseInt(year)
      updateFilters({ year: yearNum })
      
      // If a month is selected, update the date range with the new year
      if (selectedMonth !== "All") {
        const monthIndex = new Date(Date.parse(selectedMonth + " 1, " + year)).getMonth()
        const startDate = new Date(yearNum, monthIndex, 1)
        const endDate = new Date(yearNum, monthIndex + 1, 0, 23, 59, 59, 999)
        
        updateFilters({ 
          year: yearNum,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          isThisWeek: false
        })
      }
    }
  }, [selectedMonth, updateFilters])

  const handleOpenModal = useCallback((announcement) => {
    setSelectedAnnouncement(announcement)

    incrementAnnouncementViews(announcement.id).catch(err => {
      console.error('Failed to increment views:', err)
    })
  }, [])

  const handleCloseModal = useCallback(() => {
    setSelectedAnnouncement(null)
  }, [])

  const errorMessage = useMemo(() => {
    if (!error) return null
    return (
      <div className={styles.errorMessage}>
        <p>Error loading announcements: {error}</p>
      </div>
    )
  }, [error])

  return (
    <div className={styles.announcementsPage}>
      <AnnouncementsHeader />

      <div className={styles.container}>
        {errorMessage}

        {loading ? (
          <SkeletonLoader viewMode={viewMode} />
        ) : (
          <>
            <AnnouncementsFilters
              searchTerm={filters.search}
              onSearchChange={(search) => updateFilters({ search })}
              selectedCategory={filters.category}
              onCategoryChange={(category) => updateFilters({ category })}
              selectedMonth={selectedMonth}
              onMonthChange={handleMonthChange}
              selectedYear={selectedYear}
              onYearChange={handleYearChange}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              announcements={announcements}
              isThisWeekActive={isThisWeekActive}
              onThisWeekChange={handleThisWeekToggle}
            />

            <AnnouncementsList
              announcements={announcements}
              viewMode={viewMode}
              onSelectAnnouncement={handleOpenModal}
            />

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              totalCount={totalCount}
              pageSize={pageSize}
            />
          </>
        )}
      </div>

      {selectedAnnouncement && (
        <AnnouncementModal
          announcement={selectedAnnouncement}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default AnnouncementsPage