import DOMPurify from "dompurify"
import { Clock, ArrowRight } from "lucide-react"
import { memo, useMemo, useCallback } from "react"
import { formatDate } from "../utils/announcements.helpers"
import { getCategoryIcon, getCategoryClassString } from "../utils/categoryIcons.helpers"
import styles from "../styles/AnnouncementCard.module.css"

const AnnouncementCard = ({ announcement, viewMode, onClick }) => {
  // Memoize computed values to prevent recalculation on every render
  const formattedDate = useMemo(
    () => formatDate(announcement.date),
    [announcement.date]
  )

  const categoryClass = useMemo(
    () => getCategoryClassString(announcement.category),
    [announcement.category]
  )

  const categoryIcon = useMemo(
    () => getCategoryIcon(announcement.category),
    [announcement.category]
  )

  // Extract plain text from HTML and truncate
  const excerpt = useMemo(() => {
    if (!announcement.description) return '';
    
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = DOMPurify.sanitize(announcement.description)
    const textContent = tempDiv.textContent || tempDiv.innerText || ''
    
    // Remove extra whitespace
    const cleaned = textContent.replace(/\s+/g, ' ').trim()
    
    if (cleaned.length <= 150) {
      return cleaned
    }
    
    // Truncate to 150 characters and add ellipsis
    return cleaned.substring(0, 150).trim() + '...'
  }, [announcement.description])

  // Extract plain text from title
  const plainTitle = useMemo(() => {
    if (!announcement.title) return '';
    
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = DOMPurify.sanitize(announcement.title)
    return tempDiv.textContent || tempDiv.innerText || ''
  }, [announcement.title])

  // Memoize image source with fallback
  const imageSrc = useMemo(
    () => announcement.image || "/placeholder.svg",
    [announcement.image]
  )

  // Memoize click handler to prevent recreation
  const handleClick = useCallback(() => {
    onClick(announcement)
  }, [onClick, announcement])

  // Determine if image should be shown
  const showImage = useMemo(
    () => announcement.image && (
      (viewMode === "list") || (viewMode === "grid")
    ),
    [announcement.image, viewMode]
  )

  return (
    <div 
      className={styles.announcementCard} 
      onClick={handleClick}
      data-view={viewMode}
      role="article"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      {viewMode === "list" && showImage && (
        <div className={styles.imageContainer}>
          <img 
            src={imageSrc} 
            alt={plainTitle}
            loading="lazy"
          />
        </div>
      )}
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div className={styles.titleRow}>
            <div className={styles.titleSection}>
              <h2>{plainTitle}</h2>
            </div>
            <span className={`${styles.category} ${categoryClass}`}>
              {categoryIcon}
              {announcement.category}
            </span>
          </div>
          <div className={styles.dateWrapper}>
            <Clock />
            <span>{formattedDate}</span>
          </div>
        </div>
        {viewMode === "grid" && showImage && (
          <div className={styles.imageContainer}>
            <img 
              src={imageSrc} 
              alt={plainTitle}
              loading="lazy"
            />
          </div>
        )}
        <div className={styles.description}>
          <p>{excerpt}</p>
          <div className={styles.readMore}>
            Read More <ArrowRight />
          </div>
        </div>
      </div>
    </div>
  )
}

// Memo with custom comparison to prevent unnecessary re-renders
export default memo(AnnouncementCard, (prevProps, nextProps) => {
  return (
    prevProps.announcement.id === nextProps.announcement.id &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.announcement.title === nextProps.announcement.title &&
    prevProps.announcement.description === nextProps.announcement.description &&
    prevProps.announcement.date === nextProps.announcement.date &&
    prevProps.announcement.category === nextProps.announcement.category &&
    prevProps.announcement.image === nextProps.announcement.image
  )
})