import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, Task, Reminder } from '../store/useStore'
import TaskCard from '../components/TaskCard'
import AddTaskSheet from '../components/AddTaskSheet'
import ReminderSheet from '../components/ReminderSheet'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function CalendarPage() {
  const { tasks, reminders, toggleReminderDone, deleteReminder } = useStore()
  const now   = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState<string | null>(null)
  const [addType, setAddType] = useState<'task' | 'reminder' | null>(null)
  const [editReminder, setEditReminder] = useState<Reminder | null>(null)
  const today = now.toISOString().split('T')[0]

  const prevMonth = () => { if (month===0){ setMonth(11); setYear(y=>y-1) } else setMonth(m=>m-1) }
  const nextMonth = () => { if (month===11){ setMonth(0); setYear(y=>y+1) } else setMonth(m=>m+1) }

  const firstDay = new Date(year, month, 1).getDay()
  const daysIn   = new Date(year, month+1, 0).getDate()

  const getItemsForDate = (ds: string) => {
    const dayTasks = tasks.filter(t =>
      t.period === 'daily'
        ? t.createdDate === ds || t.doneDate === ds
        : t.doneDate === ds || (t.status !== 'done' && t.createdDate === ds)
    )
    const dayReminders = reminders.filter(r => r.date === ds)
    return { tasks: dayTasks, reminders: dayReminders }
  }

  const selectedItems = selected ? getItemsForDate(selected) : { tasks: [], reminders: [] }
  const isPast = selected ? selected < today : false

  return (
    <motion.div
      key="calendar"
      initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
      className="px-4 pt-5"
    >
      <h1 className="font-syne font-black text-2xl mb-4 text-text-primary">📅 Calendar</h1>

      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-9 h-9 rounded-xl bg-border-subtle text-text-secondary flex items-center justify-center active:scale-90 transition-transform">‹</button>
        <span className="font-syne font-bold text-lg text-text-primary">{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} className="w-9 h-9 rounded-xl bg-border-subtle text-text-secondary flex items-center justify-center active:scale-90 transition-transform">›</button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => <div key={d} className="text-center text-[10px] text-text-secondary py-1 uppercase tracking-wide">{d}</div>)}
      </div>

      <div className="bg-card-bg border border-border-subtle rounded-2xl overflow-hidden mb-4">
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`e${i}`} className="min-h-[52px] border-r border-b border-border-subtle/50" />
          ))}
          {Array.from({ length: daysIn }, (_, i) => {
            const d   = i + 1
            const ds  = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
            const items = getItemsForDate(ds)
            const dt = items.tasks
            const dr = items.reminders
            
            const done = dt.filter(t => t.status==='done').length
            const pct  = dt.length ? done / dt.length : null
            const isToday = ds === today
            const isSel   = ds === selected

            let heatBg = ''
            if (pct !== null) {
              heatBg = pct===1 ? 'bg-[#e8f535]/20' : pct>=0.5 ? 'bg-purple-500/20' : pct>0 ? 'bg-purple-500/10' : 'bg-red-500/10'
            }

            return (
              <button key={ds}
                onClick={() => setSelected(ds === selected ? null : ds)}
                className={`min-h-[52px] p-1.5 border-r border-b border-border-subtle/50 relative flex flex-col items-center transition-all
                  ${isSel ? 'bg-purple-500/25' : isToday ? 'bg-[#e8f535]/5' : heatBg}`}
              >
                <span className={`text-xs font-syne font-semibold ${isToday ? 'text-[#e8f535]' : 'text-text-secondary'}`}>{d}</span>
                {(dt.length > 0 || dr.length > 0) && (
                  <div className="flex gap-0.5 flex-wrap justify-center mt-1">
                    {dt.slice(0,2).map((t, ti) => (
                      <div key={`t${ti}`} className={`w-1.5 h-1.5 rounded-sm
                        ${t.status==='done'?'bg-green-500':t.status==='miss'?'bg-red-500':'bg-border-subtle'}`} />
                    ))}
                    {dr.slice(0,2).map((r, ri) => (
                      <div key={`r${ri}`} className={`w-1.5 h-1.5 rounded-full ${r.done ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:8 }}
            className="bg-card-bg border border-border-subtle rounded-2xl overflow-hidden mb-6"
          >
            <div className="px-4 py-3 border-b border-border-subtle bg-purple-500/10 flex items-center justify-between gap-3">
              <div className="font-syne font-bold text-sm text-text-primary">
                {new Date(selected+'T00:00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
              </div>
              {!isPast && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setAddType('task')}
                    className="bg-purple-500 text-white font-syne font-bold rounded-lg px-2.5 py-1 text-[9px] uppercase tracking-wider"
                  >
                    + Task
                  </button>
                  <button 
                    onClick={() => setAddType('reminder')}
                    className="bg-[#e8f535] text-black font-syne font-bold rounded-lg px-2.5 py-1 text-[9px] uppercase tracking-wider"
                  >
                    + Reminder
                  </button>
                </div>
              )}
            </div>

            {(selectedItems.tasks.length === 0 && selectedItems.reminders.length === 0) ? (
              <div className="text-center py-10 text-text-secondary">
                <div className="text-4xl mb-3">😴</div>
                <div className="text-sm">No items on this day</div>
                {!isPast && (
                  <div className="flex flex-col gap-2 items-center mt-4">
                    <button 
                      onClick={() => setAddType('task')}
                      className="bg-purple-500 text-white font-syne font-bold rounded-xl px-5 py-2 text-xs w-32"
                    >
                      + Add Task
                    </button>
                    <button 
                      onClick={() => setAddType('reminder')}
                      className="bg-[#e8f535] text-black font-syne font-bold rounded-xl px-5 py-2 text-xs w-32"
                    >
                      + Add Reminder
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 p-4">
                {selectedItems.tasks.map(t => (
                  <div key={t.id}>
                    <TaskCard task={t} readOnly={isPast} />
                  </div>
                ))}
                {selectedItems.reminders.map(r => (
                  <div key={r.id} className={`bg-bg-primary border border-border-subtle rounded-xl p-3 flex items-center justify-between ${r.done ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => !isPast && toggleReminderDone(r.id)}
                        className={`w-5 h-5 rounded border flex items-center justify-center text-[10px] ${r.done ? 'bg-green-500 border-green-500 text-white' : 'border-border-subtle'}`}
                      >
                        {r.done && '✓'}
                      </button>
                      <div>
                        <div className={`text-sm font-semibold ${r.done ? 'line-through text-text-secondary' : 'text-text-primary'}`}>{r.title}</div>
                        <div className="text-[10px] text-text-secondary">🔔 {r.time} · {r.priority}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isPast && (
                        <button onClick={() => setEditReminder(r)} className="text-text-secondary hover:text-purple-300 transition-colors text-xs">✏️</button>
                      )}
                      {!isPast && (
                        <button onClick={() => deleteReminder(r.id)} className="text-text-secondary hover:text-red-500 transition-colors text-xs">🗑</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AddTaskSheet open={addType === 'task'} onClose={() => setAddType(null)} defaultDate={selected || undefined} />
      <AnimatePresence>
        {(addType === 'reminder' || editReminder) && (
          <ReminderSheet 
            onClose={() => { setAddType(null); setEditReminder(null) }} 
            editItem={editReminder} 
            defaultDate={selected || undefined} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
