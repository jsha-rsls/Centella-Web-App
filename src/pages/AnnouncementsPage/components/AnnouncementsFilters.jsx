import { Search, Grid3x3, List, SlidersHorizontal, X, Calendar } from "lucide-react"
import { getMonths, getYears } from "../utils/announcements.helpers"
import styles from "../styles/AnnouncementsFilters.module.css"
import { useState, useMemo, useCallback, memo } from "react"

const AnnouncementsFilters = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  viewMode,
  onViewModeChange,
  announcements,
  isThisWeekActive,
  onThisWeekChange,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  // Memoize categories to prevent recreation on every render
  const categories = useMemo(() => ["All", "Announcement", "Updates"], [])
  
  // Memoize months array
  const months = useMemo(() => getMonths(), [])
  
  // Memoize years calculation - only recalculate when announcements change
  const years = useMemo(() => getYears(announcements), [announcements])

  // Memoize toggle handlers
  const toggleFilterPanel = useCallback(() => {
    setIsFilterOpen(prev => !prev)
  }, [])

  const handleGridView = useCallback(() => {
    onViewModeChange("grid")
  }, [onViewModeChange])

  const handleListView = useCallback(() => {
    onViewModeChange("list")
  }, [onViewModeChange])

  // Debounced search handler for better performance
  const handleSearchChange = useCallback((e) => {
    onSearchChange(e.target.value)
  }, [onSearchChange])

  return (
    <div className={styles.filtersWrapper}>
      <div className={styles.filters}>
        {/* Search Bar with Filter Button */}
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <div className={styles.searchInputWrapper}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
            </div>
          </div>
          <button
            className={`${styles.filterButton} ${isFilterOpen ? styles.active : ""}`}
            onClick={toggleFilterPanel}
            aria-label="Toggle filters"
            title="Toggle filters"
          >
            {isFilterOpen ? <X /> : <SlidersHorizontal />}
          </button>
          {/* Desktop View Toggle - Hidden on mobile/tablet */}
          <div className={styles.viewToggle}>
            <span className={styles.filterLabel}>View:</span>
            <button
              onClick={handleGridView}
              className={`${styles.viewButton} ${viewMode === "grid" ? styles.active : ""}`}
              title="Grid View"
              aria-label="Grid view"
            >
              <Grid3x3 />
            </button>
            <button
              onClick={handleListView}
              className={`${styles.viewButton} ${viewMode === "list" ? styles.active : ""}`}
              title="List View"
              aria-label="List view"
            >
              <List />
            </button>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        <div className={`${styles.filterPanel} ${isFilterOpen ? styles.open : ""}`}>
          {/* Date Filters */}
          <div className={styles.filterRow}>
            <span className={styles.filterLabel}>Filter By:</span>
            <button
              onClick={onThisWeekChange}
              className={`${styles.thisWeekButton} ${isThisWeekActive ? styles.active : ""}`}
              title="Show announcements from this week"
            >
              <Calendar />
              This Week
            </button>
            <div className={styles.selectGroup}>
              <span className={styles.filterLabel}>By Month:</span>
              <div className={styles.selectWrapper}>
                <select
                  value={selectedMonth}
                  onChange={(e) => onMonthChange(e.target.value)}
                  className={styles.selectFilter}
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <span className={styles.filterLabel}>By Year:</span>
              <div className={styles.selectWrapper}>
                <select
                  value={selectedYear}
                  onChange={(e) => onYearChange(e.target.value)}
                  className={styles.selectFilter}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className={styles.filterRow}>
            <span className={styles.filterLabel}>Category:</span>
            <div className={styles.categoryFilter}>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`${styles.categoryButton} ${
                    selectedCategory === category ? styles.active : ""
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Memo to prevent unnecessary re-renders
export default memo(AnnouncementsFilters)