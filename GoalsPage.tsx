import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, Task, WeeklyGoal, MonthlyGoal } from '../store/useStore'
import TaskCard from '../components/TaskCard'
import AddTaskSheet, { BottomSheet } from '../components/AddTaskSheet'
import { showToast } from '../components/Toast'

function GoalsPage({ period, label, emoji, hideHeader }: { period: Task['period']; label: string; emoji: string; hideHeader?: boolean }) {
  const { tasks } = useStore()
  const [addOpen, setAddOpen] = useState(false)

  const periodTasks = tasks.filter(t => t.period === period)
  const done = periodTasks.filter(t => t.status === 'done').length
  const pct  = periodTasks.length ? Math.round((done / periodTasks.length) * 100) : 0

  return (
    <motion.div
      key={period}
      initial={hideHeader ? {} : { opacity: 0, x: 20 }}
      animate={hideHeader ? {} : { opacity: 1, x: 0 }}
      exit={hideHeader ? {} : { opacity: 0, x: -20 }}
      className={hideHeader ? "" : "px-4 pt-5"}
    >
      {!hideHeader && (
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-syne font-black text-2xl text-text-primary">{emoji} {label}</h1>
            <div className="text-text-secondary text-xs mt-0.5">{done}/{periodTasks.length} goals completed</div>
          </div>
          <button className="bg-[#e8f535] text-black font-syne font-bold rounded-xl px-4 py-2 text-sm" onClick={() => setAddOpen(true)}>+ Add</button>
        </div>
      )}

      {periodTasks.length > 0 && (
        <div className="bg-card-bg border border-border-subtle rounded-2xl p-4 mb-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-text-secondary font-mono">Progress</span>
            <span className="font-syne font-bold text-[#e8f535]">{pct}%</span>
          </div>
          <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-purple-500 to-[#e8f535]" animate={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {periodTasks.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-text-secondary">
            <div className="text-5xl mb-3">{emoji}</div>
            <div className="text-sm">No {label.toLowerCase()} yet.</div>
            <button onClick={() => setAddOpen(true)} className="bg-[#e8f535] text-black font-syne font-bold rounded-xl px-4 py-2.5 text-sm mt-4">+ Add Goal</button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3 pb-4">
            {periodTasks.map(t => (
              <div key={t.id}>
                <TaskCard task={t} />
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <AddTaskSheet open={addOpen} onClose={() => setAddOpen(false)} defaultPeriod={period} />
    </motion.div>
  )
}

export function WeeklyPage() {
  const { weeklyGoals, addWeeklyGoal, deleteWeeklyGoal, refreshGoals } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [xp, setXp] = useState(100)

  useEffect(() => {
    refreshGoals()
  }, [refreshGoals])

  const handleAdd = () => {
    if (!title.trim()) return
    addWeeklyGoal(title, `[Weekly] ${title.trim()}`, xp)
    setTitle('')
    setAddOpen(false)
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 pt-5 pb-20">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-syne font-black text-2xl text-text-primary">📆 Weekly Goals</h1>
          <div className="text-text-secondary text-xs mt-0.5">{weeklyGoals.filter(g => g.status === 'done').length}/{weeklyGoals.length} goals completed</div>
        </div>
        <button className="bg-[#e8f535] text-black font-syne font-bold rounded-xl px-4 py-2 text-sm" onClick={() => setAddOpen(true)}>+ Add</button>
      </div>

      <div className="flex flex-col gap-4">
        {weeklyGoals.map(goal => {
          const doneCount = goal.progress.filter(p => p).length
          const pct = Math.round((doneCount / 7) * 100)
          return (
            <div key={goal.id} className="bg-card-bg border border-border-subtle rounded-2xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-syne font-bold text-text-primary text-lg">{goal.title}</h3>
                  <p className="text-[#e8f535] text-[10px] uppercase tracking-widest mt-1 font-bold">
                    Automated Tracking Active
                  </p>
                </div>
                <button onClick={() => deleteWeeklyGoal(goal.id)} className="text-text-secondary hover:text-red-500 transition-colors">🗑</button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {['M','T','W','T','F','S','S'].map((day, i) => (
                  <div
                    key={i}
                    className={`h-10 rounded-xl flex flex-col items-center justify-center transition-all border
                      ${goal.progress[i] 
                        ? 'bg-[#e8f535] border-[#e8f535] text-black' 
                        : 'bg-bg-primary border-border-subtle text-text-secondary'}`}
                  >
                    <span className="text-[10px] font-bold">{day}</span>
                    {goal.progress[i] && <span className="text-[10px]">✓</span>}
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-text-secondary mb-4 italic">Complete the daily task "[Weekly] {goal.title}" to update this progress.</p>

              <div className="flex justify-between text-[10px] mb-1.5">
                <span className="text-text-secondary font-mono">Total Progress</span>
                <span className="font-syne font-bold text-[#e8f535]">{pct}%</span>
              </div>
              <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-purple-500 to-[#e8f535]" animate={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}

        {weeklyGoals.length === 0 && (
          <div className="text-center py-10 text-text-secondary bg-card-bg/50 border border-dashed border-border-subtle rounded-2xl">
            <div className="text-3xl mb-2">📆</div>
            <div className="text-xs">No specific weekly goal set.</div>
            <button onClick={() => setAddOpen(true)} className="text-[#e8f535] text-[10px] font-bold mt-2 uppercase tracking-widest">+ Set Goal</button>
          </div>
        )}

        {/* Regular Weekly Tasks */}
        <div className="mt-6">
          <h2 className="font-syne font-bold text-text-primary text-sm mb-3 uppercase tracking-widest opacity-50">Additional Weekly Tasks</h2>
          <GoalsPage period="weekly" label="Weekly" emoji="📆" hideHeader />
        </div>
      </div>

      <AnimatePresence>
        {addOpen && (
          <BottomSheet onClose={() => setAddOpen(false)} title="📆 Set Weekly Goal">
            <div className="px-5 pb-6 flex flex-col gap-4">
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Goal Title</label>
                <input 
                  className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" 
                  placeholder="e.g. Master React Hooks" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                />
                <p className="text-[9px] text-text-secondary mt-1 italic">This will create a daily compulsory task: "[Weekly] {title || '...'}"</p>
              </div>
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Completion XP</label>
                <select 
                  className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" 
                  value={xp} 
                  onChange={e => setXp(Number(e.target.value))}
                >
                  <option value={50}>50 XP</option>
                  <option value={100}>100 XP</option>
                  <option value={250}>250 XP</option>
                </select>
              </div>
              <button className="bg-[#e8f535] text-black font-syne font-bold rounded-xl px-4 py-3 text-sm active:scale-95 transition-transform" onClick={handleAdd}>Set Goal 🚀</button>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function MonthlyPage() {
  const { monthlyGoals, addMonthlyGoal, deleteMonthlyGoal, refreshGoals } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [xp, setXp] = useState(500)

  useEffect(() => {
    refreshGoals()
  }, [refreshGoals])

  const handleAdd = () => {
    if (!title.trim()) return
    addMonthlyGoal(title, xp)
    setTitle('')
    setAddOpen(false)
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 pt-5 pb-20">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-syne font-black text-2xl text-text-primary">🗓 Monthly Goals</h1>
          <div className="text-text-secondary text-xs mt-0.5">{monthlyGoals.filter(g => g.status === 'done').length}/{monthlyGoals.length} goals completed</div>
        </div>
        <button className="bg-[#e8f535] text-black font-syne font-bold rounded-xl px-4 py-2 text-sm" onClick={() => setAddOpen(true)}>+ Add</button>
      </div>

      <div className="flex flex-col gap-4">
        {monthlyGoals.map(goal => {
          const doneCount = goal.progress.filter(p => p).length
          const totalDays = goal.progress.length
          const pct = Math.round((doneCount / totalDays) * 100)
          return (
            <div key={goal.id} className="bg-card-bg border border-border-subtle rounded-2xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-syne font-bold text-text-primary text-lg">{goal.title}</h3>
                  <p className="text-[#e8f535] text-[10px] uppercase tracking-widest mt-1 font-bold">
                    Automated Tracking Active
                  </p>
                </div>
                <button onClick={() => deleteMonthlyGoal(goal.id)} className="text-text-secondary hover:text-red-500 transition-colors">🗑</button>
              </div>

              <div className="grid grid-cols-7 gap-1.5 mb-4">
                {goal.progress.map((done, i) => (
                  <div
                    key={i}
                    className={`h-6 rounded-md flex items-center justify-center transition-all border text-[8px] font-bold
                      ${done 
                        ? 'bg-[#e8f535] border-[#e8f535] text-black' 
                        : 'bg-bg-primary border-border-subtle text-text-secondary'}`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-text-secondary mb-4 italic">Complete the daily task "[Monthly] {goal.title}" to update this progress.</p>

              <div className="flex justify-between text-[10px] mb-1.5">
                <span className="text-text-secondary font-mono">Total Progress</span>
                <span className="font-syne font-bold text-[#e8f535]">{pct}%</span>
              </div>
              <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-purple-500 to-[#e8f535]" animate={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}

        {monthlyGoals.length === 0 && (
          <div className="text-center py-10 text-text-secondary bg-card-bg/50 border border-dashed border-border-subtle rounded-2xl">
            <div className="text-3xl mb-2">🗓</div>
            <div className="text-xs">No specific monthly goal set.</div>
            <button onClick={() => setAddOpen(true)} className="text-[#e8f535] text-[10px] font-bold mt-2 uppercase tracking-widest">+ Set Goal</button>
          </div>
        )}

        {/* Regular Monthly Tasks */}
        <div className="mt-6">
          <h2 className="font-syne font-bold text-text-primary text-sm mb-3 uppercase tracking-widest opacity-50">Additional Monthly Tasks</h2>
          <GoalsPage period="monthly" label="Monthly" emoji="🗓" hideHeader />
        </div>
      </div>

      <AnimatePresence>
        {addOpen && (
          <BottomSheet onClose={() => setAddOpen(false)} title="🗓 Set Monthly Goal">
            <div className="px-5 pb-6 flex flex-col gap-4">
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Goal Title</label>
                <input 
                  className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" 
                  placeholder="e.g. Master React Hooks..." 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                />
                <p className="text-[9px] text-text-secondary mt-1 italic">This will create a daily compulsory task: "[Monthly] {title || '...'}"</p>
              </div>
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Completion XP</label>
                <select 
                  className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" 
                  value={xp} 
                  onChange={e => setXp(Number(e.target.value))}
                >
                  <option value={250}>250 XP</option>
                  <option value={500}>500 XP</option>
                  <option value={1000}>1000 XP</option>
                </select>
              </div>
              <button className="bg-[#e8f535] text-black font-syne font-bold rounded-xl px-4 py-3 text-sm active:scale-95 transition-transform" onClick={handleAdd}>Set Goal 🚀</button>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function LongtermPage() {
  const [activeTab, setActiveTab] = useState<'sixmonths' | 'yearly'>('sixmonths')
  return (
    <div>
      <div className="flex gap-2 px-4 pt-5 pb-1">
        {[
          { v: 'sixmonths', l: '6 Months' }, 
          { v: 'yearly', l: 'Yearly' }
        ].map(t => (
          <button key={t.v} onClick={() => setActiveTab(t.v as any)}
            className={`flex-1 py-2 rounded-xl text-sm font-syne font-semibold border transition-all
              ${activeTab === t.v ? 'bg-purple-500/30 border-purple-500/60 text-[#e8f535]' : 'border-border-subtle text-text-secondary'}`}>
            {t.l}
          </button>
        ))}
      </div>
      {activeTab === 'sixmonths'
        ? <GoalsPage period="sixmonths" label="6-Month Goals" emoji="📊" />
        : <GoalsPage period="yearly"    label="Yearly Goals"  emoji="🎯" />}
    </div>
  )
}
