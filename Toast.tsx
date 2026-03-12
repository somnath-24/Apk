import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

let toastFn: ((toast: any) => void) | null = null
export const showToast = (icon: string, title: string, sub?: string, type: 'default' | 'success' | 'error' = 'default') => {
  toastFn?.({ icon, title, sub, type, id: Date.now() })
}

export default function Toast() {
  const [toasts, setToasts] = useState<any[]>([])

  useEffect(() => {
    toastFn = (toast) => {
      setToasts(prev => [...prev, toast].slice(-3))
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, 3500)
    }
    return () => { toastFn = null }
  }, [])

  return (
    <div className="fixed top-20 right-4 left-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="bg-card-bg border border-border-subtle rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xl pointer-events-auto"
          >
            <span className="text-2xl">{toast.icon}</span>
            <div>
              <div className="font-syne font-bold text-sm text-text-primary">{toast.title}</div>
              {toast.sub && <div className="text-xs text-text-secondary mt-0.5">{toast.sub}</div>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
