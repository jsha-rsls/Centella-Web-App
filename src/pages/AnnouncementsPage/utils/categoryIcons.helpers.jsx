import { Megaphone, RefreshCw } from "lucide-react"
import styles from "../styles/AnnouncementCard.module.css"

export const getCategoryIcon = (category) => {
  switch (category) {
    case "Announcement":
      return <Megaphone size={14} />
    case "Update":
      return <RefreshCw size={14} />
    default:
      return <Megaphone size={14} />
  }
}

export const getCategoryClassString = (category) => {
  switch (category) {
    case "Announcement":
      return styles.categoryAnnouncement
    case "Update":
      return styles.categoryUpdate
    default:
      return styles.categoryAnnouncement
  }
}