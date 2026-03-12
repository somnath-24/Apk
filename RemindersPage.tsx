import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, Reminder } from '../store/useStore'
import { showToast } from '../components/Toast'
import ReminderSheet from '../components/ReminderSheet'

const FILTERS = ['All','Today','Upcoming','Overdue','Done']

const PRIO_CONFIG: Record<string, { color: string, icon: string, label: string }> = {
  important: { color: 'bg-red-500/15 text-red-500 border-red-500/30', icon: '🔴', label: 'Important' },
  normal:    { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: '🟡', label: 'Normal' },
  low:       { color: 'bg-green-500/15 text-green-500 border-green-500/30', icon: '🟢', label: 'Low' },
}

const todayStr = () => new Date().toISOString().split('T')[0]

function getStatus(r: Reminder) {
  if (r.done) return 'done'
  const today = todayStr()
  if (r.date < today) return 'overdue'
  if (r.date === today) return 'today'
  return 'upcoming'
}

function formatDate(date: string, time: string) {
  const d = new Date(date + 'T00:00:00')
  const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  if (!time) return label
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${label} · ${h % 12 || 12}:${String(m).padStart(2,'0')} ${ampm}`
}

const STATUS_STYLE: Record<string, string> = {
  overdue:  'border-red-500/40 bg-red-500/5',
  today:    'border-[#e8f535]/40 bg-[#e8f535]/5',
  upcoming: 'border-border-subtle',
  done:     'border-border-subtle opacity-50',
}

export default function RemindersPage() {
  const { reminders, toggleReminderDone, deleteReminder } = useStore()
  const [filter, setFilter] = useState('All')
  const [addOpen, setAddOpen] = useState(false)
  const [editItem, setEditItem] = useState<Reminder | null>(null)

  const sorted = [...reminders].sort((a, b) => {
    const order: Record<string, number> = { overdue: 0, today: 1, upcoming: 2, done: 3 }
    return (order[getStatus(a)] - order[getStatus(b)]) || a.date.localeCompare(b.date)
  })

  const filtered = sorted.filter(r => {
    const s = getStatus(r)
    if (filter === 'Today')    return s === 'today'
    if (filter === 'Upcoming') return s === 'upcoming'
    if (filter === 'Overdue')  return s === 'overdue'
    if (filter === 'Done')     return r.done
    return true
  })

  return (
    <motion.div key="reminders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 pt-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-syne font-black text-2xl text-text-primary">🔔 Reminders</h1>
        <button className="bg-[#e8f535] text-black font-syne font-bold rounded-xl px-4 py-2 text-sm" onClick={() => { setEditItem(null); setAddOpen(true) }}>+ New</button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full border text-xs font-mono transition-all
              ${filter === f ? 'bg-purple-500 border-purple-500/60 text-white' : 'border-border-subtle text-text-secondary'}`}>
            {f}
          </button>
        ))}
      </div>

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-text-secondary">
            <div className="text-5xl mb-3">🔔</div>
            <div className="text-sm">No {filter.toLowerCase()} reminders.</div>
            <button onClick={() => setAddOpen(true)} className="bg-[#e8f535] text-black font-syne font-bold rounded-xl px-4 py-2.5 text-sm mt-4">+ Add Reminder</button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3 pb-4">
            {filtered.map(r => {
              const status = getStatus(r)
              return (
                <motion.div key={r.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                  className={`bg-card-bg border rounded-xl p-4 flex gap-3 items-start ${STATUS_STYLE[status]}`}>
                  <button onClick={() => toggleReminderDone(r.id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 text-xs transition-all
                      ${r.done ? 'bg-green-500 border-green-500 text-white' : 'border-border-subtle'}`}>
                    {r.done && '✓'}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`font-syne font-semibold text-sm ${r.done ? 'line-through text-text-secondary' : 'text-text-primary'}`}>{r.title}</span>
                      {status === 'overdue' && <span className="text-[9px] font-bold text-red-500 bg-red-500/15 border border-red-500/30 rounded-full px-2 py-0.5">OVERDUE</span>}
                      {status === 'today' && <span className="text-[9px] font-bold text-[#e8f535] bg-[#e8f535]/10 border border-[#e8f535]/30 rounded-full px-2 py-0.5">TODAY</span>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs text-text-secondary">🕐 {formatDate(r.date, r.time)}</span>
                      {(() => {
                        const config = PRIO_CONFIG[r.priority] || PRIO_CONFIG.normal;
                        return (
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${config.color}`}>
                            {config.icon} {config.label}
                          </span>
                        )
                      })()}
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold border bg-bg-primary border-border-subtle text-text-secondary">{r.cat}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => { setEditItem(r); setAddOpen(true) }} className="w-8 h-8 rounded-lg bg-border-subtle/60 text-text-secondary flex items-center justify-center active:scale-90 transition-transform">✏️</button>
                    <button onClick={() => deleteReminder(r.id)} className="w-8 h-8 rounded-lg bg-border-subtle/60 text-text-secondary flex items-center justify-center active:scale-90 transition-transform hover:bg-red-500/20 hover:text-red-500">🗑</button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {addOpen && <ReminderSheet onClose={() => { setAddOpen(false); setEditItem(null) }} editItem={editItem} />}
      </AnimatePresence>
    </motion.div>
  )
}
