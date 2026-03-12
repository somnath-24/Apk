import { motion } from 'framer-motion'
import { useStore, BADGES } from '../store/useStore'

export default function RewardsPage() {
  const { badges, xp, streak, tasks } = useStore()
  const unlocked = Object.keys(badges).length

  return (
    <motion.div key="rewards" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 pt-5">
      <h1 className="font-syne font-black text-2xl mb-1 text-text-primary">🏆 Your Badges</h1>
      <p className="text-text-secondary text-xs mb-5">{unlocked} of {BADGES.length} unlocked</p>

      <div className="bg-card-bg border border-purple-500/30 rounded-2xl p-4 mb-5 bg-gradient-to-r from-purple-500/20 to-[#e8f535]/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-text-secondary mb-1">Total XP Earned</div>
            <div className="font-syne font-black text-3xl text-[#e8f535]">{xp}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-text-secondary mb-1">Best Streak</div>
            <div className="font-syne font-black text-3xl text-orange-400">{streak} 🔥</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-text-secondary mb-1">Completed</div>
            <div className="font-syne font-black text-3xl text-green-500">{tasks.filter(t=>t.status==='done').length}</div>
          </div>
        </div>
      </div>

      <div className="bg-card-bg border border-border-subtle rounded-2xl p-4 mb-5">
        {[2500, 10000, 25000, 50000, 100000].map(milestone => {
          if (xp >= milestone) return null
          const prev  = [0, 2500, 10000, 25000, 50000].find((_, i, a) => a[i + 1] === milestone) ?? 0
          const pct   = Math.min(100, Math.round(((xp - prev) / (milestone - prev)) * 100))
          return (
            <div key={milestone}>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-text-secondary">Next milestone</span>
                <span className="text-[#e8f535] font-syne font-bold">{xp} / {milestone} XP</span>
              </div>
              <div className="h-1.5 bg-border-subtle rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-purple-500 to-[#e8f535]" animate={{ width: `${pct}%` }} />
              </div>
              <div className="text-xs text-text-secondary mt-1">{milestone - xp} XP to go!</div>
            </div>
          )
        })}
        {xp >= 100000 && <div className="text-center text-[#e8f535] font-syne font-bold">🌌 Legendary Status Achieved!</div>}
      </div>

      <div className="grid grid-cols-2 gap-3 pb-4">
        {BADGES.map((b, i) => {
          const has = !!badges[b.id]
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-card-bg border rounded-2xl p-4 text-center transition-all ${has ? 'border-yellow-500/40 bg-yellow-500/5' : 'opacity-40 border-border-subtle'}`}
            >
              <div className={`text-4xl mb-2 ${has ? '' : 'grayscale'}`}>{b.icon}</div>
              <div className="font-syne font-bold text-sm mb-1 text-text-primary">{b.name}</div>
              <div className="text-[10px] text-text-secondary mb-2">{b.desc}</div>
              <div className={`text-[10px] font-bold ${has ? 'text-green-500' : 'text-text-secondary'}`}>
                {has ? '✅ Unlocked' : '🔒 Locked'}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
