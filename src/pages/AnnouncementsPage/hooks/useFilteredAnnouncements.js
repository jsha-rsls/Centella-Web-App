import { useMemo } from "react"

/**
 * Get the start and end dates for the current week (Sunday to Saturday)
 */
const getThisWeekRange = () => {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday, 6 = Saturday
  
  // Start of week (Sunday)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - dayOfWeek)
  startOfWeek.setHours(0, 0, 0, 0)
  
  // End of week (Saturday)
  const endOfWeek = new Date(now)
  endOfWeek.setDate(now.getDate() + (6 - dayOfWeek))
  endOfWeek.setHours(23, 59, 59, 999)
  
  return { startOfWeek, endOfWeek }
}

export const useFilteredAnnouncements = (
  announcements,
  searchTerm,
  selectedCategory,
  selectedMonth,
  selectedYear,
  isThisWeekActive = false
) => {
  return useMemo(() => {
    return announcements.filter((announcement) => {
      const matchesSearch =
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory =
        selectedCategory === "All" || announcement.category === selectedCategory

      const announcementDate = new Date(announcement.date)
      
      // This Week filter takes priority over month/year filters
      if (isThisWeekActive) {
        const { startOfWeek, endOfWeek } = getThisWeekRange()
        const matchesThisWeek = announcementDate >= startOfWeek && announcementDate <= endOfWeek
        return matchesSearch && matchesCategory && matchesThisWeek
      }

      // Regular month/year filters
      const matchesMonth =
        selectedMonth === "All" ||
        announcementDate.toLocaleString("en-US", { month: "long" }) === selectedMonth

      const matchesYear =
        selectedYear === "All" ||
        announcementDate.getFullYear().toString() === selectedYear

      return matchesSearch && matchesCategory && matchesMonth && matchesYear
    })
  }, [announcements, searchTerm, selectedCategory, selectedMonth, selectedYear, isThisWeekActive])
}