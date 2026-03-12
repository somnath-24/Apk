import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import TaskCard from '../components/TaskCard'
import AddTaskSheet from '../components/AddTaskSheet'

const FILTERS = ['All', 'Pending', 'Done', 'Missed']

export default function TodayPage() {
  const { tasks, streak, xp, refreshGoals } = useStore()
  const [filter, setFilter] = useState('All')
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => {
    refreshGoals()
  }, [refreshGoals])

  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(t => t.period === 'daily' && t.createdDate === today)

  const filtered = todayTasks.filter(t => {
    if (filter === 'Pending') return t.status === 'pending'
    if (filter === 'Done')    return t.status === 'done'
    if (filter === 'Missed')  return t.status === 'miss'
    return true
  })

  // Sort: Compulsory first
  const sorted = [...filtered].sort((a, b) => {
    if (a.cat === 'Compulsory' && b.cat !== 'Compulsory') return -1
    if (a.cat !== 'Compulsory' && b.cat === 'Compulsory') return 1
    return 0
  })

  const done  = todayTasks.filter(t => t.status === 'done').length
  const miss  = todayTasks.filter(t => t.status === 'miss').length
  const pct   = todayTasks.length ? Math.round((done / todayTasks.length) * 100) : 0

  return (
    <motion.div
      key="today"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-4 pt-5"
    >
      <div className="mb-5">
        <div className="text-text-secondary text-xs font-mono mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <h1 className="font-syne font-black text-2xl text-text-primary">Today's Work</h1>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { icon: '📋', label: 'Tasks',    value: todayTasks.length },
          { icon: '✅', label: 'Done',     value: done, color: 'text-green-500' },
          { icon: '📊', label: 'Progress', value: `${pct}%`, color: 'text-[#e8f535]' },
        ].map(s => (
          <div key={s.label} className="bg-card-bg border border-border-subtle rounded-2xl p-3 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className={`font-syne font-black text-xl ${s.color || 'text-text-primary'}`}>{s.value}</div>
            <div className="text-[10px] text-text-secondary uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {todayTasks.length > 0 && (
        <div className="mb-5">
          <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden mb-1">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 to-[#e8f535]" 
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }} 
            />
          </div>
          <div className="text-[10px] text-text-secondary">{done}/{todayTasks.length} tasks done · {miss} missed</div>
        </div>
      )}

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full border text-xs font-mono transition-all
              ${filter === f ? 'bg-purple-500 border-purple-500/60 text-white' : 'border-border-subtle text-text-secondary'}`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={() => setAddOpen(true)}
          className="shrink-0 ml-auto bg-[#e8f535] text-black font-syne font-bold rounded-xl px-4 py-1.5 text-xs"
        >
          + Add
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 text-text-secondary"
          >
            <div className="text-5xl mb-3">📭</div>
            <div className="text-sm">No {filter.toLowerCase()} tasks yet.</div>
            <button onClick={() => setAddOpen(true)} className="bg-[#e8f535] text-black font-syne font-bold rounded-xl px-4 py-2.5 text-sm mt-4">
              + Add your first task
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3 pb-4">
            {sorted.map(t => (
              <div key={t.id}>
                <TaskCard task={t} />
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <AddTaskSheet open={addOpen} onClose={() => setAddOpen(false)} defaultPeriod="daily" />
    </motion.div>
  )
}
