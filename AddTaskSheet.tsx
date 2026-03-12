import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore, Task } from '../store/useStore'
import { showToast } from './Toast'
import { CATS, PERIODS, XP_OPTIONS } from '../constants'

export function BottomSheet({ children, title, onClose }: { children: React.ReactNode; title?: string; onClose: () => void }) {
  return (
    <>
      <motion.div
        className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-x-0 bottom-0 z-[70] bg-card-bg rounded-t-3xl border-t border-border-subtle shadow-2xl pb-[env(safe-area-inset-bottom,20px)] max-h-[92dvh] overflow-y-auto"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      >
        <div className="w-10 h-1 bg-border-subtle rounded-full mx-auto mt-3 mb-4" />
        {title && <div className="font-syne font-bold text-lg px-5 mb-4 text-text-primary">{title}</div>}
        {children}
      </motion.div>
    </>
  )
}

export default function AddTaskSheet({ open, onClose, defaultPeriod = 'daily', defaultDate }: { open: boolean; onClose: () => void; defaultPeriod?: Task['period']; defaultDate?: string }) {
  const { addTask } = useStore()
  const [form, setForm] = useState<Partial<Task>>({
    name: '', cat: 'Studying', period: defaultPeriod, target: '', xp: 25, reward: '', notes: '', createdDate: defaultDate || new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (open) setForm({ name: '', cat: 'Studying', period: defaultPeriod, target: '', xp: 25, reward: '', notes: '', createdDate: defaultDate || new Date().toISOString().split('T')[0] })
  }, [open, defaultPeriod, defaultDate])

  const set = (k: keyof Task, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.name?.trim()) { showToast('⚠️', 'Name required'); return }
    addTask(form)
    showToast('📋', 'Task Added!', `"${form.name}" is ready to go`)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <BottomSheet onClose={onClose} title="➕ Add Work Task">
          <div className="px-5 pb-6 flex flex-col gap-4">
            <div>
              <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Task Name</label>
              <input 
                className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" 
                placeholder="e.g. Study Chapter 5..." 
                value={form.name} 
                onChange={e => set('name', e.target.value)} 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Category</label>
                <select 
                  className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" 
                  value={form.cat} 
                  onChange={e => set('cat', e.target.value)}
                >
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Period</label>
                <select 
                  className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" 
                  value={form.period} 
                  onChange={e => set('period', e.target.value)}
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
                  value={form.target} 
                  onChange={e => set('target', e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">XP Points</label>
                <select 
                  className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" 
                  value={form.xp} 
                  onChange={e => set('xp', e.target.value)}
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
                value={form.reward} 
                onChange={e => set('reward', e.target.value)} 
              />
            </div>
            <button className="bg-[#e8f535] text-black font-syne font-bold rounded-xl px-4 py-3 text-sm active:scale-95 transition-transform" onClick={handleSave}>Add Task 🚀</button>
          </div>
        </BottomSheet>
      )}
    </AnimatePresence>
  )
}
