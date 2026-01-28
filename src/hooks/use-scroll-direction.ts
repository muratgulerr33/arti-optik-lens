"use client"

import { useState, useEffect } from "react"

type ScrollDirection = "up" | "down" | null

export function useScrollDirection(threshold: number = 10) {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null)
  const [isAtTop, setIsAtTop] = useState(true)

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const updateScrollDirection = () => {
      const scrollY = window.scrollY

      // Check if at top
      const atTop = scrollY === 0
      setIsAtTop(atTop)

      // If at top, reset scroll direction
      if (atTop) {
        setScrollDirection(null)
        lastScrollY = 0
        ticking = false
        return
      }

      // Only update if scroll difference exceeds threshold
      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking = false
        return
      }

      const direction: ScrollDirection = scrollY > lastScrollY ? "down" : "up"
      setScrollDirection(direction)
      lastScrollY = scrollY
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection)
        ticking = true
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
    }
  }, [threshold])

  return { scrollDirection, isAtTop }
}
