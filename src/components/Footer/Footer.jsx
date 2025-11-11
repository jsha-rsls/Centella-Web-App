import { Building2, CreditCard, User, Bell } from "lucide-react"
import { memo, useMemo } from "react"
import styles from "./Footer.module.css"

// Memoized AppFeature component
const AppFeature = memo(({ icon: Icon, text }) => (
  <div className={styles.appFeature}>
    <Icon size={16} />
    <span>{text}</span>
  </div>
))

AppFeature.displayName = 'AppFeature'

const Footer = () => {
  // Memoize app features data
  const appFeatures = useMemo(() => [
    { icon: Building2, text: "Facility booking" },
    { icon: CreditCard, text: "Payment processing" },
    { icon: User, text: "Account management" },
    { icon: Bell, text: "Real-time notifications" }
  ], [])

  // Memoize current year to prevent recalculation
  const currentYear = useMemo(() => new Date().getFullYear(), [])

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* About Section */}
          <div className={styles.section}>
            <h3>Centella CARES</h3>
            <p>Centella Homes Subdivision</p>
            <p>Connecting our community through seamless digital experiences. Access announcements, check facility availability, and stay informed about community events.</p>
          </div>
          
          {/* Mobile App Section */}
          <div className={styles.section}>
            <h4>Mobile App</h4>
            <p>Download our mobile app for:</p>
            {appFeatures.map((feature, index) => (
              <AppFeature
                key={index}
                icon={feature.icon}
                text={feature.text}
              />
            ))}
          </div>
        </div>
        
        {/* Copyright */}
        <div className={styles.bottom}>
          <p>&copy; {currentYear} Centella Homes Subdivision HOA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default memo(Footer)