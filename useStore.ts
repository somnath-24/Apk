import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { showToast } from '../components/Toast'

export interface Task {
  id: number
  name: string
  cat: string
  period: 'daily' | 'weekly' | 'monthly' | 'sixmonths' | 'yearly'
  target?: string
  xp: number
  reward?: string
  notes?: string
  status: 'pending' | 'done' | 'miss'
  doneReason?: string
  doneRating?: number
  missReason?: string
  missPlan?: string
  createdDate: string
  doneDate: string | null
}

export interface Reminder {
  id: number
  title: string
  date: string
  time: string
  cat: string
  repeat: 'none' | 'daily' | 'weekly' | 'monthly'
  priority: 'important' | 'normal' | 'low'
  notes?: string
  done: boolean
  notified?: boolean
  createdAt: number
}

export interface WeeklyGoal {
  id: number
  title: string
  linkedTaskName: string // The name of the daily task to track
  progress: boolean[] // 7 days
  startDate: string
  xp: number
  status: 'active' | 'done' | 'failed'
}

export interface MonthlyGoal {
  id: number
  title: string
  progress: boolean[] // Days of the month
  startDate: string
  xp: number
  status: 'active' | 'done' | 'failed'
}

export interface Badge {
  id: string
  icon: string
  name: string
  desc: string
  check: (state: HabitraState) => boolean
}

export const BADGES: Badge[] = [
  { id: 'b1',  icon: '🌱', name: 'First Step',   desc: 'Complete your first task',   check: (s) => s.tasks.filter(t => t.status === 'done').length >= 1 },
  { id: 'b2',  icon: '📚', name: 'Scholar',       desc: 'Complete 50 tasks',          check: (s) => s.tasks.filter(t => t.status === 'done').length >= 50 },
  { id: 'b3',  icon: '🎯', name: 'Consistent',    desc: 'Complete 250 tasks',         check: (s) => s.tasks.filter(t => t.status === 'done').length >= 250 },
  { id: 'b3_1',icon: '🏛️', name: 'Architect',     desc: 'Complete 1000 tasks',        check: (s) => s.tasks.filter(t => t.status === 'done').length >= 1000 },
  
  { id: 'b4',  icon: '🔥', name: 'On Fire',       desc: '14-day streak',              check: (s) => s.streak >= 14 },
  { id: 'b5',  icon: '🏅', name: 'Week Warrior',  desc: '30-day streak',              check: (s) => s.streak >= 30 },
  { id: 'b6',  icon: '💎', name: 'Diamond Mind',  desc: '100-day streak',             check: (s) => s.streak >= 100 },
  { id: 'b6_1',icon: '♾️', name: 'Unstoppable',   desc: '365-day streak',             check: (s) => s.streak >= 365 },
  
  { id: 'b7',  icon: '⚡', name: 'Energized',     desc: 'Earn 2500 XP',               check: (s) => s.xp >= 2500 },
  { id: 'b8',  icon: '🌟', name: 'Star Learner',  desc: 'Earn 10000 XP',              check: (s) => s.xp >= 10000 },
  { id: 'b9',  icon: '👑', name: 'Champion',      desc: 'Earn 50000 XP',              check: (s) => s.xp >= 50000 },
  
  { id: 'b10', icon: '🧠', name: 'Grand Master',  desc: 'Use all 9 task categories', check: (s) => {
    const cats = ['Studying','Reading','Writing','Learning','Practice','Assignment','Project','Revision','Research']
    const used = new Set(s.tasks.filter(t => t.status === 'done').map(t => t.cat))
    return cats.every(c => used.has(c))
  }},
  { id: 'b11', icon: '🏔️', name: 'Summit',        desc: 'Complete 5 Monthly Goals',   check: (s) => s.monthlyGoals.filter(g => g.status === 'done').length >= 5 },
  { id: 'b12', icon: '🌌', name: 'Legendary',     desc: 'Complete 12 Monthly Goals',  check: (s) => s.monthlyGoals.filter(g => g.status === 'done').length >= 12 },
]

export interface BinItem {
  id: number
  type: 'task' | 'reminder' | 'weeklyGoal' | 'monthlyGoal'
  data: any
  deletedAt: string
}

interface HabitraState {
  tasks: Task[]
  reminders: Reminder[]
  weeklyGoals: WeeklyGoal[]
  monthlyGoals: MonthlyGoal[]
  bin: BinItem[]
  xp: number
  streak: number
  lastDoneDate: string | null
  logs: { id: number; msg: string; time: string }[]
  badges: Record<string, boolean>
  theme: 'light' | 'dark' | 'system'
  initialized: boolean
  
  addTask: (task: Partial<Task>) => void
  completeTask: (id: number, reason: string, rating: number | null) => void
  missTask: (id: number, reason: string, plan: string) => void
  updateTask: (id: number, updates: Partial<Task>) => void
  deleteTask: (id: number) => void
  
  addReminder: (reminder: Partial<Reminder>) => void
  updateReminder: (id: number, updates: Partial<Reminder>) => void
  toggleReminderDone: (id: number) => void
  deleteReminder: (id: number) => void

  addWeeklyGoal: (title: string, linkedTaskName: string, xp: number) => void
  toggleWeeklyProgress: (goalId: number, dayIndex: number) => void
  syncWeeklyGoals: () => void
  syncMonthlyGoals: () => void
  refreshGoals: () => void // New method to ensure daily tasks exist
  deleteWeeklyGoal: (id: number) => void

  addMonthlyGoal: (title: string, xp: number) => void
  toggleMonthlyProgress: (goalId: number, weekIndex: number) => void
  deleteMonthlyGoal: (id: number) => void
  
  restoreFromBin: (binId: number) => void
  permanentDeleteFromBin: (binId: number) => void
  cleanupBin: () => void
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setReminderNotified: (id: number) => void
  clearAll: () => void
  loadDemoData: () => void
  updateStreak: () => void
  checkBadges: () => void
}

const todayStr = () => new Date().toISOString().split('T')[0]

export const useStore = create<HabitraState>()(
  persist(
    (set, get) => ({
      tasks: [],
      reminders: [],
      weeklyGoals: [],
      monthlyGoals: [],
      bin: [],
      xp: 0,
      streak: 0,
      lastDoneDate: null,
      logs: [],
      badges: {},
      theme: 'system',
      initialized: true,

      addTask: (task) => {
        const newTask: Task = {
          id: Date.now(),
          status: 'pending',
          doneReason: '',
          doneRating: undefined,
          missReason: '',
          missPlan: '',
          createdDate: todayStr(),
          doneDate: null,
          name: '',
          cat: 'Other',
          period: 'daily',
          xp: 25,
          ...task,
        } as Task
        set((s) => ({ tasks: [...s.tasks, newTask] }))
      },

      completeTask: (id, reason, rating) => {
        const state = get()
        const task = state.tasks.find((t) => t.id === id)
        if (!task) return

        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, status: 'done', doneReason: reason, doneRating: rating ?? undefined, doneDate: todayStr() }
              : t
          ),
          xp: s.xp + task.xp,
          logs: [
            { id: Date.now(), msg: `✅ Done: ${task.name} (+${task.xp} XP)`, time: new Date().toLocaleTimeString() },
            ...s.logs,
          ].slice(0, 50),
        }))

        get().updateStreak()
        get().checkBadges()
        get().refreshGoals()
      },

      missTask: (id, reason, plan) => {
        const state = get()
        const task = state.tasks.find((t) => t.id === id)
        if (!task) return

        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, status: 'miss', missReason: reason, missPlan: plan } : t
          ),
          logs: [
            { id: Date.now(), msg: `❌ Missed: ${task.name}`, time: new Date().toLocaleTimeString() },
            ...s.logs,
          ].slice(0, 50),
        }))
      },

      updateTask: (id, updates) => {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }))
      },

      deleteTask: (id) => {
        const task = get().tasks.find(t => t.id === id)
        if (!task) return
        const binItem: BinItem = { id: Date.now(), type: 'task', data: task, deletedAt: todayStr() }
        set((s) => ({ 
          tasks: s.tasks.filter((t) => t.id !== id),
          bin: [binItem, ...s.bin]
        }))
        showToast('🗑', 'Moved to Bin', task.name)
      },

      addReminder: (reminder) => {
        const newReminder: Reminder = {
          id: Date.now(),
          done: false,
          createdAt: Date.now(),
          title: '',
          date: todayStr(),
          time: '09:00',
          cat: 'Other',
          repeat: 'none',
          priority: 'normal',
          ...reminder,
        } as Reminder
        set((s) => ({ reminders: [...s.reminders, newReminder] }))
      },

      updateReminder: (id, updates) => {
        set((s) => ({
          reminders: s.reminders.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        }))
      },

      toggleReminderDone: (id) => {
        const reminder = get().reminders.find((r) => r.id === id)
        if (!reminder) return

        const nowDone = !reminder.done

        if (nowDone && reminder.repeat && reminder.repeat !== 'none') {
          const next = new Date(reminder.date + 'T00:00:00')
          if (reminder.repeat === 'daily') next.setDate(next.getDate() + 1)
          if (reminder.repeat === 'weekly') next.setDate(next.getDate() + 7)
          if (reminder.repeat === 'monthly') next.setMonth(next.getMonth() + 1)
          
          const nextReminder: Reminder = {
            ...reminder,
            id: Date.now(),
            date: next.toISOString().split('T')[0],
            done: false,
            createdAt: Date.now(),
          }
          set((s) => ({
            reminders: [...s.reminders.map((r) => (r.id === id ? { ...r, done: true } : r)), nextReminder],
          }))
        } else {
          set((s) => ({
            reminders: s.reminders.map((r) => (r.id === id ? { ...r, done: nowDone } : r)),
          }))
        }
      },

      deleteReminder: (id) => {
        const reminder = get().reminders.find(r => r.id === id)
        if (!reminder) return
        const binItem: BinItem = { id: Date.now(), type: 'reminder', data: reminder, deletedAt: todayStr() }
        set((s) => ({ 
          reminders: s.reminders.filter((r) => r.id !== id),
          bin: [binItem, ...s.bin]
        }))
        showToast('🗑', 'Moved to Bin', reminder.title)
      },

      addWeeklyGoal: (title, linkedTaskName, xp) => {
        const newGoal: WeeklyGoal = {
          id: Date.now(),
          title,
          linkedTaskName,
          progress: Array(7).fill(false),
          startDate: todayStr(),
          xp,
          status: 'active'
        }
        set((s) => ({ weeklyGoals: [...s.weeklyGoals, newGoal] }))
        get().refreshGoals()
      },

      refreshGoals: () => {
        const state = get()
        const today = todayStr()
        
        // 1. Ensure a daily task exists for every active weekly goal
        state.weeklyGoals.forEach(goal => {
          if (goal.status !== 'active') return
          
          const compulsoryName = `[Weekly] ${goal.title}`
          const taskExists = state.tasks.some(t => 
            t.name === compulsoryName && 
            t.createdDate === today
          )
          
          if (!taskExists) {
            get().addTask({
              name: compulsoryName,
              cat: 'Compulsory',
              period: 'daily',
              xp: 15,
              notes: `Automated task for weekly goal: ${goal.title}`
            })
          }
        })

        // 2. Ensure a daily task exists for every active monthly goal
        state.monthlyGoals.forEach(goal => {
          if (goal.status !== 'active') return
          
          const compulsoryName = `[Monthly] ${goal.title}`
          const taskExists = state.tasks.some(t => 
            t.name === compulsoryName && 
            t.createdDate === today
          )
          
          if (!taskExists) {
            get().addTask({
              name: compulsoryName,
              cat: 'Compulsory',
              period: 'daily',
              xp: 20,
              notes: `Automated task for monthly goal: ${goal.title}`
            })
          }
        })

        // 3. Sync progress
        get().syncWeeklyGoals()
        get().syncMonthlyGoals()
      },

      syncWeeklyGoals: () => {
        const state = get()
        const today = new Date()
        
        set((s) => ({
          weeklyGoals: s.weeklyGoals.map((goal) => {
            const nextProgress = [...goal.progress]
            const compulsoryName = `[Weekly] ${goal.title}`
            
            // For each day of the current week (Mon-Sun)
            const currentDay = today.getDay() // 0-6 (Sun-Sat)
            const mondayOffset = (currentDay + 6) % 7 // 0-6 (Mon-Sun)
            
            for (let i = 0; i < 7; i++) {
              const targetDate = new Date()
              targetDate.setDate(today.getDate() - (mondayOffset - i))
              const dateStr = targetDate.toISOString().split('T')[0]
              
              const isDone = s.tasks.some(t => 
                t.name === compulsoryName && 
                t.status === 'done' && 
                t.doneDate === dateStr
              )
              
              if (isDone) nextProgress[i] = true
            }

            const allDone = nextProgress.every(p => p)
            return { 
              ...goal, 
              progress: nextProgress, 
              status: allDone ? 'done' : 'active'
            }
          })
        }))

        // Award XP for newly completed goals
        const updatedState = get()
        updatedState.weeklyGoals.forEach(goal => {
          const oldGoal = state.weeklyGoals.find(g => g.id === goal.id)
          if (goal.status === 'done' && oldGoal?.status === 'active') {
            set(s => ({ xp: s.xp + goal.xp }))
            showToast('🏆', 'Weekly Goal Reached!', goal.title)
          }
        })
      },

      syncMonthlyGoals: () => {
        const state = get()
        const today = new Date()
        const year = today.getFullYear()
        const month = today.getMonth()
        const daysInMonth = new Date(year, month + 1, 0).getDate()

        set((s) => ({
          monthlyGoals: s.monthlyGoals.map((goal) => {
            const nextProgress = [...goal.progress]
            if (nextProgress.length !== daysInMonth) {
              // Adjust length if month changed or newly created
              while (nextProgress.length < daysInMonth) nextProgress.push(false)
              if (nextProgress.length > daysInMonth) nextProgress.splice(daysInMonth)
            }

            const compulsoryName = `[Monthly] ${goal.title}`
            
            for (let i = 1; i <= daysInMonth; i++) {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
              
              const isDone = s.tasks.some(t => 
                t.name === compulsoryName && 
                t.status === 'done' && 
                t.doneDate === dateStr
              )
              
              if (isDone) nextProgress[i-1] = true
            }

            const allDone = nextProgress.every(p => p)
            return { 
              ...goal, 
              progress: nextProgress, 
              status: allDone ? 'done' : 'active'
            }
          })
        }))

        // Award XP for newly completed goals
        const updatedState = get()
        updatedState.monthlyGoals.forEach(goal => {
          const oldGoal = state.monthlyGoals.find(g => g.id === goal.id)
          if (goal.status === 'done' && oldGoal?.status === 'active') {
            set(s => ({ xp: s.xp + goal.xp }))
            showToast('👑', 'Monthly Goal Reached!', goal.title)
          }
        })
      },

      toggleWeeklyProgress: (goalId, dayIndex) => {
        set((s) => ({
          weeklyGoals: s.weeklyGoals.map((g) => {
            if (g.id !== goalId) return g
            const nextProgress = [...g.progress]
            nextProgress[dayIndex] = !nextProgress[dayIndex]
            
            const allDone = nextProgress.every(p => p)
            return { 
              ...g, 
              progress: nextProgress, 
              status: allDone ? 'done' : 'active',
              // If it just became done, we'll handle XP in a separate effect or here
            }
          }),
          // Add XP if completed
          xp: s.xp + (s.weeklyGoals.find(g => g.id === goalId)?.progress.every(p => p) ? 0 : 0) // Simplified for now
        }))
        
        // Check if just completed to award XP
        const goal = get().weeklyGoals.find(g => g.id === goalId)
        if (goal && goal.progress.every(p => p)) {
           set(s => ({ xp: s.xp + goal.xp }))
           showToast('🏆', 'Weekly Goal Reached!', goal.title)
        }
      },

      deleteWeeklyGoal: (id) => {
        const goal = get().weeklyGoals.find(g => g.id === id)
        if (!goal) return
        const binItem: BinItem = { id: Date.now(), type: 'weeklyGoal', data: goal, deletedAt: todayStr() }
        set((s) => ({ 
          weeklyGoals: s.weeklyGoals.filter((g) => g.id !== id),
          bin: [binItem, ...s.bin]
        }))
        showToast('🗑', 'Moved to Bin', goal.title)
      },

      addMonthlyGoal: (title, xp) => {
        const today = new Date()
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
        const newGoal: MonthlyGoal = {
          id: Date.now(),
          title,
          progress: Array(daysInMonth).fill(false),
          startDate: todayStr(),
          xp,
          status: 'active'
        }
        set((s) => ({ monthlyGoals: [...s.monthlyGoals, newGoal] }))
        get().refreshGoals()
      },

      toggleMonthlyProgress: (goalId, weekIndex) => {
        set((s) => ({
          monthlyGoals: s.monthlyGoals.map((g) => {
            if (g.id !== goalId) return g
            const nextProgress = [...g.progress]
            nextProgress[weekIndex] = !nextProgress[weekIndex]
            
            const allDone = nextProgress.every(p => p)
            return { 
              ...g, 
              progress: nextProgress, 
              status: allDone ? 'done' : 'active'
            }
          })
        }))

        const goal = get().monthlyGoals.find(g => g.id === goalId)
        if (goal && goal.progress.every(p => p)) {
           set(s => ({ xp: s.xp + goal.xp }))
           showToast('👑', 'Monthly Goal Reached!', goal.title)
        }
      },

      deleteMonthlyGoal: (id) => {
        const goal = get().monthlyGoals.find(g => g.id === id)
        if (!goal) return
        const binItem: BinItem = { id: Date.now(), type: 'monthlyGoal', data: goal, deletedAt: todayStr() }
        set((s) => ({ 
          monthlyGoals: s.monthlyGoals.filter((g) => g.id !== id),
          bin: [binItem, ...s.bin]
        }))
        showToast('🗑', 'Moved to Bin', goal.title)
      },

      updateStreak: () => {
        const today = todayStr()
        const state = get()
        if (state.lastDoneDate === today) return
        
        const yest = new Date()
        yest.setDate(yest.getDate() - 1)
        const yStr = yest.toISOString().split('T')[0]
        
        const newStreak = state.lastDoneDate === yStr ? state.streak + 1 : 1
        set({ streak: newStreak, lastDoneDate: today })
      },

      checkBadges: () => {
        const state = get()
        const newBadges = { ...state.badges }
        let found = false
        BADGES.forEach((b) => {
          if (!newBadges[b.id] && b.check(state)) {
            newBadges[b.id] = true
            found = true
          }
        })
        if (found) set({ badges: newBadges })
      },

      restoreFromBin: (binId) => {
        const item = get().bin.find(i => i.id === binId)
        if (!item) return
        
        set(s => {
          const nextBin = s.bin.filter(i => i.id !== binId)
          if (item.type === 'task') return { tasks: [...s.tasks, item.data], bin: nextBin }
          if (item.type === 'reminder') return { reminders: [...s.reminders, item.data], bin: nextBin }
          if (item.type === 'weeklyGoal') return { weeklyGoals: [...s.weeklyGoals, item.data], bin: nextBin }
          if (item.type === 'monthlyGoal') return { monthlyGoals: [...s.monthlyGoals, item.data], bin: nextBin }
          return s
        })
        showToast('♻️', 'Restored', 'Item returned to its place')
      },

      permanentDeleteFromBin: (binId) => {
        set(s => ({ bin: s.bin.filter(i => i.id !== binId) }))
      },

      cleanupBin: () => {
        const now = new Date()
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
        
        set(s => ({
          bin: s.bin.filter(item => {
            const deletedDate = new Date(item.deletedAt)
            return deletedDate > thirtyDaysAgo
          })
        }))
      },

      setTheme: (theme) => set({ theme }),

      setReminderNotified: (id) => {
        set((s) => ({
          reminders: s.reminders.map((r) => (r.id === id ? { ...r, notified: true } : r)),
        }))
      },

      clearAll: () => {
        set({ tasks: [], reminders: [], weeklyGoals: [], monthlyGoals: [], bin: [], xp: 0, streak: 0, lastDoneDate: null, logs: [], badges: {}, theme: 'system' })
      },

      loadDemoData: () => {
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]
        
        // Mock Weekly Goal
        const weeklyGoal: WeeklyGoal = {
          id: 1,
          title: 'Morning Yoga',
          linkedTaskName: '[Weekly] Morning Yoga',
          progress: [true, true, true, false, false, false, false],
          startDate: todayStr,
          xp: 100,
          status: 'active'
        }

        // Mock Monthly Goal
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
        const monthlyProgress = Array(daysInMonth).fill(false).map((_, i) => i < 10)
        const monthlyGoal: MonthlyGoal = {
          id: 2,
          title: 'Read 20 Pages',
          progress: monthlyProgress,
          startDate: todayStr,
          xp: 500,
          status: 'active'
        }

        // Mock Tasks to support the goals
        const demoTasks: Task[] = []
        for (let i = 0; i < 3; i++) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const dStr = d.toISOString().split('T')[0]
          demoTasks.push({
            id: Date.now() + i,
            name: '[Weekly] Morning Yoga',
            cat: 'Compulsory',
            period: 'daily',
            xp: 15,
            status: 'done',
            createdDate: dStr,
            doneDate: dStr
          } as Task)
        }

        set({
          weeklyGoals: [weeklyGoal],
          monthlyGoals: [monthlyGoal],
          tasks: [...get().tasks, ...demoTasks],
          xp: get().xp + 300,
          streak: 3,
          initialized: true
        })
        
        showToast('🚀', 'Demo Data Loaded', 'Check Weekly/Monthly pages!')
      }
    }),
    {
      name: 'habitra-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
