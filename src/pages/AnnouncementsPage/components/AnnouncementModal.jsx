import { X, Clock, Eye } from "lucide-react"
import { memo, useMemo, useEffect, useCallback } from "react"
import { formatDate } from "../utils/announcements.helpers"
import { getCategoryIcon, getCategoryClassString } from "../utils/categoryIcons.helpers"
import { sanitizeHtml } from "../utils/htmlSanitizer"
import styles from "../styles/AnnouncementModal.module.css"

const AnnouncementModal = ({ announcement, onClose }) => {
  // Memoize sanitized content - expensive operations
  const sanitizedContent = useMemo(
    () => sanitizeHtml(announcement.description),
    [announcement.description]
  )

  const sanitizedTitle = useMemo(
    () => sanitizeHtml(announcement.title),
    [announcement.title]
  )

  // Memoize formatted date
  const formattedDate = useMemo(
    () => formatDate(announcement.date),
    [announcement.date]
  )

  // Memoize category helpers
  const categoryClass = useMemo(
    () => getCategoryClassString(announcement.category),
    [announcement.category]
  )

  const categoryIcon = useMemo(
    () => getCategoryIcon(announcement.category),
    [announcement.category]
  )

  // Memoize views text
  const viewsText = useMemo(() => {
    if (!announcement.views || announcement.views === 0) return null
    return `${announcement.views} ${announcement.views === 1 ? 'view' : 'views'}`
  }, [announcement.views])

  // Combine both side effects into one for better performance
  useEffect(() => {
    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    // Handle ESC key to close modal
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)

    // Cleanup both effects
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener("keydown", handleEscape)
    }
  }, [onClose])

  // Memoize backdrop click handler
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  // Memoize content click handler (stops propagation)
  const handleContentClick = useCallback((e) => {
    e.stopPropagation()
  }, [])

  return (
    <div className={styles.modal} onClick={handleBackdropClick}>
      <div 
        className={styles.modalContent} 
        onClick={handleContentClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close modal"
          type="button"
        >
          <X />
        </button>

        <div className={styles.modalHeader}>
          <div className={styles.categoryBadge}>
            <span className={`${styles.category} ${categoryClass}`}>
              {categoryIcon}
              {announcement.category}
            </span>
          </div>

          <h2
            id="modal-title"
            className={styles.modalTitle}
            dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
          />

          <div className={styles.modalMeta}>
            <div className={styles.metaItem}>
              <Clock size={16} />
              <span>{formattedDate}</span>
            </div>
            {viewsText && (
              <div className={styles.metaItem}>
                <Eye size={16} />
                <span>{viewsText}</span>
              </div>
            )}
          </div>
        </div>

        {announcement.image && (
          <div className={styles.imageWrapper}>
            <img
              src={announcement.image}
              alt={announcement.title}
              className={styles.modalImage}
              loading="eager"
            />
          </div>
        )}

        <div className={styles.modalBody}>
          <div
            className={styles.modalDescription}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>
      </div>
    </div>
  )
}

// Memo with custom comparison to prevent unnecessary re-renders
export default memo(AnnouncementModal, (prevProps, nextProps) => {
  // Only re-render if the announcement ID changes or onClose changes
  // (since modal is only shown when announcement exists)
  return (
    prevProps.announcement?.id === nextProps.announcement?.id &&
    prevProps.onClose === nextProps.onClose
  )
})