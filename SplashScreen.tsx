import { motion } from 'framer-motion'

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-bg-primary flex flex-col items-center justify-center gap-6 z-[100]">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-[#e8f535] flex items-center justify-center shadow-2xl"
      >
        <span className="text-5xl">🧠</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <div className="font-syne font-black text-3xl text-text-primary">Habit<span className="text-[#e8f535]">ra</span></div>
        <div className="text-text-secondary text-xs mt-1 font-mono tracking-widest">HABIT TRACKER</div>
      </motion.div>
    </div>
  )
}
