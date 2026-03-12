import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import Toast, { showToast } from './Toast'
import { BottomSheet } from './AddTaskSheet'

const NAV = [
  { path: '/today',     icon: '📋', label: 'Today' },
  { path: '/reminders', icon: '🔔', label: 'Reminders', badge: true },
  { path: '/weekly',    icon: '📆', label: 'Weekly' },
  { path: '/monthly',   icon: '🗓', label: 'Monthly' },
  { path: '/rewards',   icon: '🏆', label: 'Rewards' },
]

const TOOLS = [
  { path: '/calendar', icon: '📅', label: 'Calendar' },
  { path: '/longterm', icon: '📊', label: 'Long-term' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { reminders, xp, streak, theme, setTheme } = useStore()
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  const dueBadge = reminders.filter(r => {
    if (r.done) return false
    return r.date <= new Date().toISOString().split('T')[0]
  }).length

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-primary text-text-primary font-mono">
      {/* Status bar spacer */}
      <div className="h-[env(safe-area-inset-top,0px)] bg-bg-primary shrink-0 print:hidden" />

      {/* Print-only Header */}
      <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
        <h1 className="text-3xl font-syne font-black">Habitra Progress Report</h1>
        <p className="text-sm font-mono mt-2">Generated on {new Date().toLocaleDateString()} • {streak} Day Streak • {xp} Total XP</p>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-primary/90 backdrop-blur-xl shrink-0 z-40 print:hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-card-bg border border-border-subtle flex items-center justify-center text-lg active:scale-90 transition-transform"
          >
            ☰
          </button>
          <div className="font-syne font-black text-xl tracking-tight text-text-primary">
            Habit<span className="text-[#e8f535]">ra</span>
            <sub className="text-[10px] text-text-secondary font-mono font-normal ml-1 tracking-widest">tracker</sub>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 bg-card-bg border border-border-subtle rounded-full px-3 py-1">
            <span className="text-xs">🔥</span>
            <span className="text-xs font-syne font-bold text-orange-400">{streak}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-card-bg border border-border-subtle rounded-full px-3 py-1">
            <span className="text-xs">⚡</span>
            <span className="text-xs font-syne font-bold text-purple-400">{xp} XP</span>
          </div>
        </div>
      </header>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-[calc(80px+env(safe-area-inset-bottom,0px))]">
        {children}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 pb-[env(safe-area-inset-bottom,0px)] bg-card-bg/95 backdrop-blur-2xl border-t border-border-subtle z-50 print:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV.map(item => {
            const active = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all relative"
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-purple-500/20 border border-purple-500/40 rounded-2xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="text-xl relative z-10">{item.icon}</span>
                {item.badge && dueBadge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                    {dueBadge}
                  </span>
                )}
                <span className={`text-[10px] font-syne font-semibold relative z-10 ${active ? 'text-[#e8f535]' : 'text-text-secondary'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div 
              className="fixed inset-y-0 left-0 z-[110] w-72 bg-card-bg border-r border-border-subtle shadow-2xl flex flex-col"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="p-6 border-b border-border-subtle">
                <div className="font-syne font-black text-2xl tracking-tight mb-1 text-text-primary">
                  Habit<span className="text-[#e8f535]">ra</span>
                </div>
                <div className="text-[10px] text-text-secondary uppercase tracking-[0.2em]">Menu & Tools</div>
              </div>
              
              <div className="flex-1 py-6 px-4 flex flex-col gap-2">
                {TOOLS.map(item => {
                  const active = location.pathname === item.path
                  return (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); setSidebarOpen(false) }}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group
                        ${active ? 'bg-purple-500/20 border border-purple-500/40 text-[#e8f535]' : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'}`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-syne font-bold text-sm tracking-wide">{item.label}</span>
                      {active && <span className="ml-auto text-[#e8f535]">●</span>}
                    </button>
                  )
                })}

                <div className="mt-auto pt-4">
                  <div className="px-4 text-[10px] text-text-secondary uppercase tracking-[0.2em] mb-2">Appearance</div>
                  <div className="grid grid-cols-3 gap-2 px-2">
                    {[
                      { id: 'light',  label: 'Light', icon: '☀️' },
                      { id: 'dark',   label: 'Dark',  icon: '🌙' },
                      { id: 'system', label: 'Auto',  icon: '🌓' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id as any)
                          showToast(t.icon, 'Theme Updated', `Switched to ${t.label}`)
                        }}
                        className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all active:scale-95
                          ${theme === t.id 
                            ? 'bg-purple-500/20 border-purple-500 text-[#e8f535]' 
                            : 'bg-bg-primary border-border-subtle text-text-secondary'}`}
                      >
                        <span className="text-lg mb-0.5">{t.icon}</span>
                        <span className="text-[9px] font-bold uppercase tracking-tighter">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border-subtle bg-bg-primary/50">
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="w-full py-3 rounded-xl bg-bg-primary border border-border-subtle text-text-primary text-xs font-bold uppercase tracking-widest active:scale-95 transition-transform"
                >
                  Close Menu
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Toast />
    </div>
  )
}
