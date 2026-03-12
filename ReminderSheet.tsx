import { useState } from 'react'
import { useStore, Reminder } from '../store/useStore'
import { showToast } from './Toast'
import { BottomSheet } from './AddTaskSheet'

const CATS    = ['Work','Study','Personal','Health','Finance','Other']
const REPEATS = ['none','daily','weekly','monthly']
const PRIOS   = [{ v:'important', l:'🔴 Important' },{ v:'normal', l:'🟡 Normal' },{ v:'low', l:'🟢 Low' }]

const todayStr = () => new Date().toISOString().split('T')[0]

export default function ReminderSheet({ onClose, editItem, defaultDate }: { onClose: () => void; editItem: Reminder | null; defaultDate?: string }) {
  const { addReminder, updateReminder } = useStore()
  const [form, setForm] = useState<Partial<Reminder>>(editItem ? { ...editItem } : {
    title: '', date: defaultDate || todayStr(), time: '09:00',
    cat: 'Work', repeat: 'none', priority: 'normal', notes: ''
  })

  const set = (k: keyof Reminder, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.title?.trim()) { showToast('⚠️', 'Title required'); return }
    if (editItem) {
      updateReminder(editItem.id, form)
      showToast('✅', 'Reminder Updated!', form.title)
    } else {
      addReminder(form)
      showToast('🔔', 'Reminder Set!', form.title)
    }
    onClose()
  }

  return (
    <BottomSheet onClose={onClose} title={editItem ? '✏️ Edit Reminder' : '🔔 New Reminder'}>
      <div className="px-5 pb-6 flex flex-col gap-4">
        <div>
          <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Title</label>
          <input className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" placeholder="e.g. Submit assignment..." value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Date</label>
            <div className="relative">
              <input type="date" className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Time (AM/PM)</label>
            <div className="relative">
              <input type="time" className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" value={form.time} onChange={e => set('time', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Category</label>
            <select className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" value={form.cat} onChange={e => set('cat', e.target.value)}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Repeat</label>
            <select className="w-full bg-bg-primary border border-border-subtle rounded-xl px-3 py-2.5 text-sm font-mono text-text-primary outline-none focus:border-purple-500 transition-colors" value={form.repeat} onChange={e => set('repeat', e.target.value)}>
              {REPEATS.map(r => <option key={r} value={r}>{r === 'none' ? 'No repeat' : r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-text-secondary uppercase tracking-widest mb-1.5">Priority</label>
          <div className="grid grid-cols-3 gap-2">
            {PRIOS.map(p => (
              <button key={p.v} onClick={() => set('priority', p.v)}
                className={`py-2 rounded-xl border text-xs font-mono transition-all
                  ${form.priority === p.v ? 'bg-purple-500/30 border-purple-500/60 text-text-primary' : 'border-border-subtle text-text-secondary'}`}>
                {p.l}
              </button>
            ))}
          </div>
        </div>
        <button className="bg-[#e8f535] text-black font-syne font-bold rounded-xl px-4 py-3 text-sm active:scale-95 transition-transform" onClick={handleSave}>
          {editItem ? 'Update Reminder ✓' : 'Save Reminder 🔔'}
        </button>
      </div>
    </BottomSheet>
  )
}
