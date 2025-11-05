import { Link } from "react-router-dom"
import { Megaphone, Building2, ArrowRight, Home, Smartphone, Search } from "lucide-react"
import { useEffect, useRef, useState, useCallback, useMemo, memo } from "react"
import styles from "./HomePage.module.css"
import logo from "../../assets/app-logo.png"

// Memoized QuickLink component to prevent unnecessary re-renders
const QuickLink = memo(({ to, icon: Icon, title, description }) => (
  <Link to={to} className={styles.quickLink}>
    <div className={styles.linkIcon}>
      <Icon />
    </div>
    <div className={styles.linkContent}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
    <div className={styles.linkArrow}>
      <ArrowRight />
    </div>
  </Link>
))

QuickLink.displayName = 'QuickLink'

// Memoized Feature component
const Feature = memo(({ icon: Icon, title, description }) => (
  <div className={styles.feature}>
    <div className={styles.featureIcon}>
      <Icon />
    </div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
))

Feature.displayName = 'Feature'

const HomePage = () => {
  const [isInLight, setIsInLight] = useState(false)
  const featuresRef = useRef(null)
  
  // Use RAF to throttle scroll events
  const scrollRafId = useRef(null)

  // Memoize quick links data
  const quickLinks = useMemo(() => [
    {
      to: "/announcements",
      icon: Megaphone,
      title: "Announcements",
      description: "Stay updated with community news"
    },
    {
      to: "/facility-availability",
      icon: Building2,
      title: "Facility Availability",
      description: "Check community facility schedules"
    }
  ], [])

  // Memoize features data
  const features = useMemo(() => [
    {
      icon: Home,
      title: "Exclusive to Centella Homes",
      description: "This platform is designed specifically for our subdivision residents"
    },
    {
      icon: Smartphone,
      title: "Mobile App Available",
      description: "Download our mobile app for booking facilities, payments, and account management"
    },
    {
      icon: Search,
      title: "Easy Information Access",
      description: "Quickly find announcements and check facility availability"
    }
  ], [])

  // Optimized scroll handler with RAF throttling
  const handleScroll = useCallback(() => {
    // Cancel any pending RAF
    if (scrollRafId.current) {
      cancelAnimationFrame(scrollRafId.current)
    }

    // Schedule new RAF
    scrollRafId.current = requestAnimationFrame(() => {
      if (!featuresRef.current) return

      const headerElement = featuresRef.current.querySelector(`.${styles.sectionHeader}`)
      
      if (!headerElement) return

      const headerRect = headerElement.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      
      // Get the bottom position of the entire header section
      const headerBottom = headerRect.bottom
      
      // Check if the bottom of header is in the bottom 40% of viewport
      const isInLightArea = headerBottom > (viewportHeight * 0.6)
      
      // Only update state if value actually changed
      setIsInLight(prev => {
        if (prev !== isInLightArea) {
          return isInLightArea
        }
        return prev
      })
    })
  }, [])

  useEffect(() => {
    // Add scroll listener with passive flag for better performance
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Check initial position
    handleScroll()

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollRafId.current) {
        cancelAnimationFrame(scrollRafId.current)
      }
    }
  }, [handleScroll])

  return (
    <div className={styles.homePage}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroCard}>
            <div className={styles.mobileLogo}>
              <div className={styles.logoBox}>
                <img 
                  src={logo} 
                  alt="HOA Logo" 
                  className={styles.logoImage}
                  loading="eager"
                />
              </div>
            </div>
            <h1>Welcome to HOA Connect</h1>
            <h2>Centella Homes Subdivision</h2>
            <p>Your gateway to community information and facility availability</p>
          </div>
          
          <div className={styles.quickLinks}>
            {quickLinks.map((link) => (
              <QuickLink
                key={link.to}
                to={link.to}
                icon={link.icon}
                title={link.title}
                description={link.description}
              />
            ))}
          </div>
        </div>
      </section>

      <section 
        ref={featuresRef} 
        className={styles.features} 
        data-in-light={isInLight}
      >
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Community Features</h2>
            <p>Everything you need for a connected community experience</p>
          </div>
          
          <div className={styles.featureGrid}>
            {features.map((feature, index) => (
              <Feature
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage