// hooks/use-auto-theme.ts
"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

export type ThemeMode = "light" | "dark" | "auto"

export function useAutoTheme() {
  const { setTheme } = useTheme()
  const [mode, setMode] = useState<ThemeMode>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("theme-mode") as ThemeMode | null
    if (saved) setMode(saved)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const applyTheme = () => {
      if (mode === "auto") {
        const hour = new Date().getHours()
        // Activa oscuro desde las 7:00 PM (19) hasta las 6:59 AM (7)
        const isNight = hour >= 19 || hour < 7
        setTheme(isNight ? "dark" : "light")
      } else {
        setTheme(mode)
      }
    }

    applyTheme()
    const interval = setInterval(applyTheme, 60_000)
    return () => clearInterval(interval)
  }, [mode, mounted, setTheme])

  const changeMode = (newMode: ThemeMode) => {
    setMode(newMode)
    localStorage.setItem("theme-mode", newMode)
  }

  return { mode, changeMode, mounted }
}