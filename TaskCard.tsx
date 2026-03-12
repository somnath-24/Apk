import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, Task } from '../store/useStore'
import { showToast } from './Toast'
import { BottomSheet } from './AddTaskSheet'
import { CATS, PERIODS, XP_OPTIONS } from '../constants'

const CAT_COLORS: Record<string, string> = {
  Studying:   'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Reading:    'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Writing:    'bg-pink-500/20 text-pink-400 border-pink-500/30',
  Learning:   'bg-teal-500/20 text-teal-400 border-teal-500/30',
  Practice:   'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Assignment: 'bg-red-500/20 text-red-400 border-red-500/30',
  Project:    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Revision:   'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Research:   'bg-green-500/20 text-green-400 border-green-500/30',
  Compulsory: 'bg-red-500/20 text-red-400 border-red-500/30',
  Other:      'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

const PERIOD_LABELS: Record<string, string> = {
  daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly',
  sixmonths: '6 Months', yearly: 'Yearly'
}

export default function TaskCard({ task, readOnly = false }: { task: Task; readOnly?: boolean }) {
  const { completeTask, missTask, deleteTask, updateTask } = useStore()
  const location = useLocation()
  const [sheet, setSheet] = useState<null | 'done' | 'miss' | 'edit'>(null)
  const [reason, setReason] = useState('')
  const [achievement, setAchievement] = useState('')
  const [rating, setRating] = useState<number | ''>('')
  const [plan,   setPlan]   = useState('')
  const [editForm, setEditForm] = useState<Partial<Task>>({})

  const today = new Date().toISOString().split('T')[0]
  const isAutomated = task.name.startsWith('[Weekly]') || task.name.startsWith('[Monthly]')
  const isToday = task.createdDate === today
  const isCalendar = location.pathname === '/calendar'

  // Anti-cheat logic:
  // 1. Automated tasks are NEVER editable
  // 2. Regular tasks are editable ONLY on their creation day, UNLESS in the calendar view
  const canEdit = !isAutomated && (isToday || isCalendar)

  const openSheet = (type: 'done' | 'miss' | 'edit') => {
    setReason(''); setAchievement(''); setRating(''); setPlan('')
    if (type === 'edit') {
      if (!canEdit) {
        showToast('🔒', 'Locked', isAutomated ? 'Automated goals cannot be edited.' : 'Daily tasks can only be edited on their day.')
        return
      }
      setEditForm({ ...task })
    }
    setSheet(type)
  }

  const handleDone = () => {
    if (!reason.trim()) { showToast('⚠️', 'Reason needed'); return }
    
    let finalReason = reason.trim()
    if ((task.name.startsWith('[Weekly]') || task.name.startsWith('[Monthly]')) && achievement.trim()) {
      finalReason = `Achievement: ${achievement.trim()}\n\nReason: ${reason.trim()}`
    }

    completeTask(task.id, finalReason, typeof rating === 'number' ? rating : null)
    showToast('⚡', `+${task.xp} XP!`, `"${task.name}" completed!`)
    setSheet(null)
  }

  const handleMiss = () => {
    if (!reason.trim()) { showToast('⚠️', 'Reason needed'); return }
    missTask(task.id, reason.trim(), plan.trim())
    showToast('💪', 'Noted!', 'Reflect and bounce back.')
    setSheet(null)
  }

  const handleEdit = () => {
    if (!editForm.name?.trim()) { showToast('⚠️', 'Name required'); return }
    updateTask(task.id, editForm)
    showToast('✏️', 'Task Updated!', `"${editForm.name}" saved`)
    setSheet(null)
  }

  const statusColor = task.status === 'done'
    ? 'border-green-500/30'
    : task.status === 'miss'
      ? 'border-red-500/30'
      : 'border-[#2e2e42]'

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={`bg-card-bg border rounded-2xl p-4 flex gap-3 items-start relative overflow-hidden ${statusColor}`}
      >
        {task.status !== 'pending' && (
          <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${task.status === 'done' ? 'bg-green-500' : 'bg-red-500'}`} />
        )}

        <button
          onClick={() => task.status === 'pending' && openSheet('done')}
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all
            ${task.status === 'done' ? 'bg-green-500 border-green-500 text-white text-xs' : 'border-border-subtle'}`}
        >
          {task.status === 'done' && '✓'}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className={`font-syne font-semibold text-sm ${task.status === 'done' ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
              {task.name}
            </p>
            {task.cat === 'Compulsory' && (
              <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter">Required</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${CAT_COLORS[task.cat] || CAT_COLORS.Other}`}>{task.cat}</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold border bg-purple-500/20 text-purple-300 border-purple-500/30">{PERIOD_LABELS[task.period]}</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold border bg-yellow-500/15 text-yellow-500 border-yellow-500/30">+{task.xp} XP</span>
            {task.target && <span className="text-[10px] text-text-secondary">🎯 {task.target}</span>}
          </div>
          {task.reward && <p className="text-xs text-text-secondary mb-1">🎁 <span className="text-yellow-500">{task.reward}</span></p>}
          {task.status === 'done' && task.doneReason && (
            <div className="mt-2 text-[10px] bg-green-500/10 border border-green-500/20 rounded-lg px-2 py-1.5 text-green-500/90">
              ✅ {task.doneReason}{task.doneRating ? ` · ${task.doneRating}/10 focus` : ''}
            </div>
          )}
          {task.status === 'miss' && task.missReason && (
            <div className="mt-2 text-[10px] bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1.5 text-red-500/90">
              ❌ {task.missReason}
              {task.missPlan && <div className="text-yellow-500/80 mt-1">💡 {task.missPlan}</div>}
            </div>
          )}
        </div>

        {!readOnly && (
          <div className="flex flex-col gap-1.5 shrink-0">
            {task.status === 'pending' && (
              <>
                <button onClick={() => openSheet('done')} className="w-9 h-9 rounded-xl bg-border-subtle text-text-secondary flex items-center justify-center active:scale-90 transition-transform hover:bg-green-500/20 hover:text-green-500">✅</button>
                <button onClick={() => openSheet('miss')} className="w-9 h-9 rounded-xl bg-border-subtle text-text-secondary flex items-center justify-center active:scale-90 transition-transform hover:bg-red-500/20 hover:text-red-500">❌</button>
              </>
            )}
            {canEdit && (
              <button onClick={() => openSheet('edit')} className="w-9 h-9 rounded-xl bg-border-subtle text-text-secondary flex items-center justify-center active:scale-90 transition-transform hover:bg-purple-500/20 hover:text-purple-300">✏️</button>
            )}
            <button onClick={() => deleteTask(task.id)} className="w-9 h-9 rounded-xl bg-border-subtle text-text-secondary flex items-center justify-center active:scale-90 transition-transform hover:bg-red-500/20 hover:text-red-500">🗑</button>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {sheet === 'done' && (
          <BottomSheet onClose={() => setSheet(null)} title="✅ Complete Task">
            <div className="px-5 pb-4 flex flex-col gap-4">
              {(task.name.startsWith('[Weekly]') || task.name.startsWith('[Monthly]')) && (
                <div>
                  <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">
                    What did you achieve today for this {task.name.startsWith('[Weekly]') ? 'weekly' : 'monthly'} task?
                  </label>
                  <textarea 
                    className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors min-h-[80px] resize-none" 
                    placeholder="Type your daily progress here..." 
                    value={achievement} 
                    onChange={e => setAchievement(e.target.value)} 
                  />
                </div>
              )}
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">
                  Why did you complete this?
                </label>
                <textarea 
                  className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors min-h-[80px] resize-none" 
                  placeholder="What helped you finish?..." 
                  value={reason} 
                  onChange={e => setReason(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Focus / Energy (1–10)</label>
                <input 
                  type="number" 
                  className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" 
                  placeholder="e.g. 8" 
                  value={rating} 
                  onChange={e => setRating(e.target.value ? Number(e.target.value) : '')} 
                />
              </div>
              <button className="bg-[#e8f535] text-black font-syne font-bold rounded-xl px-4 py-3 text-sm active:scale-95 transition-transform" onClick={handleDone}>Mark Complete ⚡</button>
            </div>
          </BottomSheet>
        )}
        {sheet === 'miss' && (
          <BottomSheet onClose={() => setSheet(null)} title="❌ Mark as Missed">
            <div className="px-5 pb-4 flex flex-col gap-4">
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Why did you miss this?</label>
                <textarea 
                  className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors min-h-[80px] resize-none" 
                  placeholder="Be honest with yourself..." 
                  value={reason} 
                  onChange={e => setReason(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">What will you do differently?</label>
                <textarea 
                  className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors min-h-[70px] resize-none" 
                  placeholder="e.g. start earlier..." 
                  value={plan} 
                  onChange={e => setPlan(e.target.value)} 
                />
              </div>
              <button className="bg-red-500/20 border border-red-500/40 text-red-500 font-mono rounded-xl px-4 py-3 text-sm active:scale-95 transition-transform" onClick={handleMiss}>Mark Missed</button>
            </div>
          </BottomSheet>
        )}
        {sheet === 'edit' && (
          <BottomSheet onClose={() => setSheet(null)} title="✏️ Edit Task">
             <div className="px-5 pb-6 flex flex-col gap-4">
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Task Name</label>
                <input 
                  className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Category</label>
                  <select 
                    className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" 
                    value={editForm.cat} 
                    onChange={e => setEditForm({...editForm, cat: e.target.value})}
                  >
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Period</label>
                  <select 
                    className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" 
                    value={editForm.period} 
                    onChange={e => setEditForm({...editForm, period: e.target.value as any})}
                  >
                    {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Target</label>
                  <input 
                    className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" 
                    placeholder="2 hours / 20 pages" 
                    value={editForm.target} 
                    onChange={e => setEditForm({...editForm, target: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">XP Points</label>
                  <select 
                    className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" 
                    value={editForm.xp} 
                    onChange={e => setEditForm({...editForm, xp: Number(e.target.value)})}
                  >
                    {XP_OPTIONS.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">🎁 Reward if Completed</label>
                <input 
                  className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" 
                  placeholder="e.g. Watch a show..." 
                  value={editForm.reward} 
                  onChange={e => setEditForm({...editForm, reward: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">📝 Notes</label>
                <textarea 
                  className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors min-h-[60px] resize-none" 
                  placeholder="Additional details..." 
                  value={editForm.notes} 
                  onChange={e => setEditForm({...editForm, notes: e.target.value})} 
                />
              </div>
              <button className="bg-[#e8f535] text-black font-syne font-bold rounded-xl px-4 py-3 text-sm active:scale-95 transition-transform" onClick={handleEdit}>Save Changes ✓</button>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </>
  )
}
