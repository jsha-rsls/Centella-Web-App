import AnnouncementCard from "./AnnouncementCard"
import { memo, useCallback, useMemo } from "react"
import styles from "../styles/AnnouncementsList.module.css"

const NoResults = memo(() => (
  <div className={styles.noResults}>
    <p>No announcements found matching your criteria.</p>
  </div>
))

NoResults.displayName = 'NoResults'

const AnnouncementsList = ({ announcements, viewMode, onSelectAnnouncement }) => {
  // Memoize the list class name
  const listClassName = useMemo(
    () => `${styles.announcementsList} ${viewMode === "list" ? styles.listView : ""}`,
    [viewMode]
  )

  // Memoize the select handler factory
  const createSelectHandler = useCallback(
    (announcement) => () => onSelectAnnouncement(announcement),
    [onSelectAnnouncement]
  )

  // Early return for empty state
  if (announcements.length === 0) {
    return <NoResults />
  }

  return (
    <div className={listClassName}>
      {announcements.map((announcement) => (
        <AnnouncementCard
          key={announcement.id}
          announcement={announcement}
          viewMode={viewMode}
          onClick={createSelectHandler(announcement)}
        />
      ))}
    </div>
  )
}

// Memo to prevent re-renders when parent updates but props haven't changed
export default memo(AnnouncementsList, (prevProps, nextProps) => {
  return (
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.announcements === nextProps.announcements &&
    prevProps.onSelectAnnouncement === nextProps.onSelectAnnouncement
  )
})