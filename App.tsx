import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useStore } from './store/useStore'
import AppShell from './components/AppShell'
import SplashScreen from './components/SplashScreen'
import { sendNotification } from './utils/notifications'

// Pages
import TodayPage from './pages/TodayPage'
import { WeeklyPage, MonthlyPage, LongtermPage } from './pages/GoalsPage'
import RemindersPage from './pages/RemindersPage'
import RewardsPage from './pages/RewardsPage'
import CalendarPage from './pages/CalendarPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const { initialized, refreshGoals, cleanupBin, theme } = useStore()
  const [showSplash, setShowSplash] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const root = window.document.documentElement
    
    const applyTheme = (t: 'light' | 'dark' | 'system') => {
      const root = window.document.documentElement
      let actualTheme = t
      
      if (t === 'system') {
        try {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          actualTheme = isDark ? 'dark' : 'light'
        } catch (e) {
          actualTheme = 'dark' // Default to dark for this app's aesthetic if detection fails
        }
      }
      
      if (actualTheme === 'dark') {
        root.classList.add('dark')
        root.style.colorScheme = 'dark'
      } else {
        root.classList.remove('dark')
        root.style.colorScheme = 'light'
      }
    }

    applyTheme(theme)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (useStore.getState().theme === 'system') {
        applyTheme('system')
      }
    }

    try {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } catch (e) {
      // Fallback for older browsers/webviews
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [theme])

  useEffect(() => {
    refreshGoals()
    cleanupBin()
    const timer = setTimeout(() => setShowSplash(false), 2000)
    
    // Periodic refresh every minute to handle day changes and reminders
    const interval = setInterval(() => {
      refreshGoals()
      
      // Check for reminders
      const { reminders, setReminderNotified } = useStore.getState()
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const currentTime = now.toTimeString().slice(0, 5) // HH:MM

      reminders.forEach(r => {
        if (!r.done && !r.notified && r.date === today && r.time <= currentTime) {
          sendNotification(
            `🔔 Reminder: ${r.title}`,
            `${r.time} • ${r.cat}`,
            r.id
          )
          setReminderNotified(r.id)
        }
      })
    }, 60000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [refreshGoals])

  if (showSplash || !initialized) return <SplashScreen />

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<AppShell><Navigate to="/today" replace /></AppShell>} />
        <Route path="/today" element={<AppShell><TodayPage /></AppShell>} />
        <Route path="/weekly" element={<AppShell><WeeklyPage /></AppShell>} />
        <Route path="/monthly" element={<AppShell><MonthlyPage /></AppShell>} />
        <Route path="/longterm" element={<AppShell><LongtermPage /></AppShell>} />
        <Route path="/reminders" element={<AppShell><RemindersPage /></AppShell>} />
        <Route path="/rewards" element={<AppShell><RewardsPage /></AppShell>} />
        <Route path="/calendar" element={<AppShell><CalendarPage /></AppShell>} />
        <Route path="/settings" element={<AppShell><SettingsPage /></AppShell>} />
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Routes>
    </AnimatePresence>
  )
}
