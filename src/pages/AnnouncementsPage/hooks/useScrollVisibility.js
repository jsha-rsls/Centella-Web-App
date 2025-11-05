import { useState, useEffect, useRef } from "react"

export const useScrollVisibility = () => {
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const scrollTimeout = useRef(null)
  const ticking = useRef(false)

  useEffect(() => {
    const updateVisibility = () => {
      const currentScrollY = window.scrollY
      const scrollDifference = currentScrollY - lastScrollY.current

      if (Math.abs(scrollDifference) > 5) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          setIsVisible(false)
        } else if (scrollDifference < -10) {
          setIsVisible(true)
        }
        lastScrollY.current = currentScrollY
      }

      ticking.current = false
    }

    const handleScroll = () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }

      if (!ticking.current) {
        window.requestAnimationFrame(updateVisibility)
        ticking.current = true
      }

      scrollTimeout.current = setTimeout(() => {
        if (window.scrollY <= 100) {
          setIsVisible(true)
        }
      }, 150)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [])

  return isVisible
}