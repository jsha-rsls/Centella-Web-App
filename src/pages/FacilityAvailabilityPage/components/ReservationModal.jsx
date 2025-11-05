import { useState, useEffect } from "react"
import { Smartphone, QrCode, X, CheckCircle2, Download } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import styles from "../styles/ReservationModal.module.css"

const ReservationModal = ({ isOpen, onClose, selectedFacility, selectedSlot }) => {
  // Production URL - always points to your live domain
  const downloadUrl = "https://centellahomes.com/downloads/Centella%20App.apk"

  // Handle body scroll for modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [isOpen, onClose])

  const handleDownload = () => {
    // Create a temporary link and trigger download
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = 'Centella App.apk'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className={styles.modalHeader}>
          <Smartphone size={48} className={styles.modalIcon} />
          <h3>Reserve via Mobile App</h3>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.modalMessage}>
            To reserve <strong>{selectedFacility}</strong> for <strong>{selectedSlot?.time}</strong>, please
            download our mobile app for a seamless booking experience.
          </p>

          <div className={styles.qrCodeSection}>
            <div className={styles.qrCodePlaceholder}>
              <QRCodeSVG 
                value={downloadUrl}
                size={120}
                level="H"
                includeMargin={false}
                style={{ display: 'block' }}
              />
            </div>
            <p className={styles.qrCodeLabel}>Scan with your camera app</p>
          </div>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <button className={styles.modalDownloadButton} onClick={handleDownload}>
            <Download size={20} />
            Download App
          </button>
          <p className={styles.installNote}>Direct install - No store needed</p>

          <div className={styles.appFeatures}>
            <div className={styles.feature}>
              <CheckCircle2 size={16} />
              <span>Get confirmed in under 10 seconds</span>
            </div>
            <div className={styles.feature}>
              <CheckCircle2 size={16} />
              <span>View, modify, or cancel anytime</span>
            </div>
            <div className={styles.feature}>
              <CheckCircle2 size={16} />
              <span>Never miss an opening with live alerts</span>
            </div>
            <div className={styles.feature}>
              <CheckCircle2 size={16} />
              <span>Easy 2-minute setup</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReservationModal