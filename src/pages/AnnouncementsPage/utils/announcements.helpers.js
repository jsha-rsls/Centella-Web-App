export const getFilterHeight = () => {
  const filterElement = document.querySelector('[data-filter-wrapper]')
  return filterElement ? filterElement.offsetHeight : 0
}

export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const getCategoryClass = (category) => {
  // Import styles where you use this function
  // This function now only returns the class name string
  switch (category) {
    case "Announcement":
      return "categoryAnnouncement"
    case "Update":
      return "categoryUpdate"
    default:
      return "categoryAnnouncement"
  }
}

export const getMonths = () => [
  "All",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export const getYears = (announcements) => {
  const years = ["All"]
  announcements.forEach((announcement) => {
    const year = new Date(announcement.date).getFullYear().toString()
    if (!years.includes(year)) {
      years.push(year)
    }
  })
  return years.sort((a, b) => (a === "All" ? -1 : b - a))
}