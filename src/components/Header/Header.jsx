import { Link, useLocation } from "react-router-dom"
import { memo, useMemo } from "react"
import styles from "./Header.module.css"
import logo from "../../assets/app-logo.png"

const Header = () => {
  const location = useLocation()
  
  // Memoize navigation items to prevent recreation on every render
  const navItems = useMemo(() => [
    { path: "/", label: "Home" },
    { path: "/announcements", label: "Announcements" },
    { path: "/facility-availability", label: "Facility Schedule" }
  ], [])

  // Memoize active path check
  const isActive = useMemo(() => (path) => {
    return location.pathname === path
  }, [location.pathname])

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoWrapper}>
          <Link to="/" className={styles.logoLink}>
            <div className={styles.logoBox}>
              <img src={logo} alt="HOA Logo" className={styles.logoImage} />
            </div>
          </Link>
          <div className={styles.logoText}>
            <h1>Centella CARES</h1>
            <p>Centella Homes Subdivision</p>
          </div>
        </div>
        <nav className={styles.nav}>
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`${styles.navLink} ${isActive(path) ? styles.active : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

// Memo to prevent re-renders when parent components update
export default memo(Header)