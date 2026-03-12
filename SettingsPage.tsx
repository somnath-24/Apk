import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { showToast } from '../components/Toast'
import { BottomSheet } from '../components/AddTaskSheet'
import { requestNotificationPermission } from '../utils/notifications'
import { Share } from '@capacitor/share'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

export default function SettingsPage() {
  const { tasks, reminders, xp, streak, bin, clearAll, restoreFromBin, permanentDeleteFromBin, theme, setTheme, loadDemoData } = useStore()
  const [isClearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [isBinOpen, setBinOpen] = useState(false)

  const handleLoadDemo = () => {
    loadDemoData()
  }

  const handleExport = async () => {
    try {
      const state = useStore.getState()
      const fileName = `habitra-backup-${new Date().toISOString().split('T')[0]}.json`
      const data = JSON.stringify(state, null, 2)

      // On Android/Capacitor, we write to a temp file and share it
      const result = await Filesystem.writeFile({
        path: fileName,
        data: data,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      })

      await Share.share({
        title: 'Habitra Backup',
        text: 'My Habitra progress backup',
        url: result.uri,
        dialogTitle: 'Save your backup',
      })
      
      showToast('📤', 'JSON Exported!', 'Backup ready to save')
    } catch (error) {
      console.error('Export failed:', error)
      showToast('❌', 'Export Failed', 'Could not save backup file')
    }
  }

  const handleCSVExport = async () => {
    try {
      const { tasks, weeklyGoals, monthlyGoals } = useStore.getState()
      
      const formatDate = (dateStr: string | null) => {
        if (!dateStr || dateStr === '-') return '-'
        try {
          const [y, m, d] = dateStr.split('-')
          const shortYear = y.slice(-2)
          return `=""${d}/${m}/${shortYear}""`
        } catch (e) {
          return dateStr
        }
      }

      let csv = 'TYPE,NAME/TITLE,CATEGORY,PERIOD,STATUS,XP,GIVEN DATE,COMPLETED DATE,REWARD\n'
      
      tasks.forEach(t => {
        const reward = t.reward ? `"${t.reward}"` : '-'
        csv += `TASK,"${t.name}","${t.cat}","${t.period}","${t.status}",${t.xp},"${formatDate(t.createdDate)}","${formatDate(t.doneDate)}",${reward}\n`
      })
      
      weeklyGoals.forEach(g => {
        const progress = g.progress.map(p => p ? 'Y' : 'N').join('')
        csv += `WEEKLY_GOAL,"${g.title}","-","-","${g.status}",${g.xp},"${formatDate(g.startDate)}","${progress}","-"\n`
      })

      monthlyGoals.forEach(g => {
        const progress = g.progress.map(p => p ? 'Y' : 'N').join('')
        csv += `MONTHLY_GOAL,"${g.title}","-","-","${g.status}",${g.xp},"${formatDate(g.startDate)}","${progress}","-"\n`
      })

      const fileName = `habitra-report-${new Date().toISOString().split('T')[0]}.csv`
      
      const result = await Filesystem.writeFile({
        path: fileName,
        data: csv,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      })

      await Share.share({
        title: 'Habitra Report',
        text: 'My Habitra progress report',
        url: result.uri,
        dialogTitle: 'Save your report',
      })

      showToast('📊', 'CSV Exported!', 'Report ready to save')
    } catch (error) {
      console.error('CSV Export failed:', error)
      showToast('❌', 'Export Failed', 'Could not save report file')
    }
  }

  const handleClear = () => {
    setClearConfirmOpen(true)
  }

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      showToast('🔔', 'Notifications Enabled', 'You will now receive alerts for reminders')
    } else {
      showToast('❌', 'Permission Denied', 'Please enable notifications in your browser settings')
    }
  }

  const confirmClear = () => {
    clearAll()
    setClearConfirmOpen(false)
    showToast('🗑', 'Data Cleared', 'All data has been removed')
  }

  const settingSections = [
    {
      title: '🔔 Notifications',
      description: 'Get alerted when your reminders are due.',
      actions: [
        { 
          icon: '📢', 
          label: 'Enable Notifications', 
          sub: 'Request app permission for alerts', 
          onClick: handleEnableNotifications, 
          style: 'default' 
        },
      ]
    },
    {
      title: '📊 Your Data',
      items: [
        { icon: '📋', label: 'Total Tasks', value: tasks.length },
        { icon: '✅', label: 'Completed',   value: tasks.filter(t=>t.status==='done').length },
        { icon: '🔔', label: 'Reminders',   value: reminders.length },
        { icon: '⚡', label: 'Total XP',    value: `${xp} XP` },
        { icon: '🔥', label: 'Current Streak', value: `${streak} days` },
      ]
    },
    {
      title: '💾 Backup & Reports',
      description: 'Export your progress in different formats.',
      actions: [
        { icon: '📊', label: 'Export Excel (CSV)', sub: 'Readable spreadsheet format', onClick: handleCSVExport, style: 'default' },
        { icon: '📤', label: 'JSON Backup', sub: 'Technical data for restoring', onClick: handleExport, style: 'default' },
        { icon: '🗑️', label: 'Recycle Bin', sub: `${bin.length} items stored for 30 days`, onClick: () => setBinOpen(true), style: 'default' },
      ]
    },
    {
      title: '🛠️ Developer Tools',
      description: 'Test features with sample data.',
      actions: [
        { icon: '🚀', label: 'Load Demo Data', sub: 'Populate app with sample progress', onClick: handleLoadDemo, style: 'default' },
      ]
    },
    {
      title: '⚠️ Danger Zone',
      actions: [
        { icon: '🗑', label: 'Clear All Data', sub: 'Permanently delete everything', onClick: handleClear, style: 'danger' },
      ]
    }
  ]

  return (
    <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 pt-5 pb-6">
      <h1 className="font-syne font-black text-2xl mb-5 text-text-primary">⚙️ Settings</h1>

      <div className="bg-card-bg border border-purple-500/30 rounded-2xl p-4 mb-5 bg-gradient-to-r from-purple-500/15 to-transparent">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <div className="font-syne font-bold text-sm mb-1 text-text-primary">100% Local Storage</div>
            <div className="text-xs text-text-secondary leading-relaxed">
              All your data lives only on <strong className="text-text-primary">this device</strong>.
              No servers, no cloud, no accounts.
            </div>
          </div>
        </div>
      </div>

      {settingSections.map(section => (
        <div key={section.title} className="mb-5">
          <div className="text-xs text-text-secondary uppercase tracking-widest font-mono mb-3">{section.title}</div>
          <div className="bg-card-bg border border-border-subtle rounded-2xl overflow-hidden divide-y divide-border-subtle">
            {section.items?.map(item => (
              <div key={item.label} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <span className="text-sm text-text-primary">{item.label}</span>
                </div>
                <span className="font-syne font-bold text-[#e8f535] text-sm">{item.value}</span>
              </div>
            ))}
            {section.actions?.map(action => (
              <button type="button" key={action.label} onClick={action.onClick}
                className={`w-full flex items-center justify-between px-4 py-3 text-left active:bg-bg-primary transition-colors
                  ${action.style === 'danger' ? 'text-red-500' : 'text-text-primary'}`}>
                <div className="flex items-center gap-3">
                  <span>{action.icon}</span>
                  <div>
                    <div className="text-sm font-syne font-semibold">{action.label}</div>
                    <div className="text-xs text-text-secondary">{action.sub}</div>
                  </div>
                </div>
                <span className="text-text-secondary">›</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <AnimatePresence>
        {isClearConfirmOpen && (
          <BottomSheet onClose={() => setClearConfirmOpen(false)} title="⚠️ Clear All Data?">
            <div className="px-5 pb-8">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
                <p className="text-sm text-red-200 leading-relaxed">
                  This action is <strong className="text-red-500">permanent</strong> and cannot be undone. 
                  All your tasks, streaks, XP, and badges will be wiped from this device.
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmClear}
                  className="w-full py-4 rounded-2xl bg-red-500 text-white font-syne font-black text-sm uppercase tracking-widest active:scale-95 transition-transform"
                >
                  Yes, Delete Everything
                </button>
                <button 
                  onClick={() => setClearConfirmOpen(false)}
                  className="w-full py-4 rounded-2xl bg-[#2e2e42] text-white font-syne font-bold text-sm active:scale-95 transition-transform"
                >
                  Cancel
                </button>
              </div>
            </div>
          </BottomSheet>
        )}

        {isBinOpen && (
          <BottomSheet onClose={() => setBinOpen(false)} title="🗑️ Recycle Bin">
            <div className="px-5 pb-8">
              <p className="text-[10px] text-[#6b6b8a] uppercase tracking-widest mb-4">Items are deleted after 30 days</p>
              
              <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto mb-6 pr-1">
                {bin.length === 0 ? (
                  <div className="text-center py-10 text-text-secondary text-sm italic">Bin is empty</div>
                ) : (
                  bin.map(item => (
                    <div key={item.id} className="bg-bg-primary border border-border-subtle rounded-xl p-3 flex items-center justify-between">
                      <div className="flex-1 min-w-0 mr-3">
                        <div className="text-xs font-bold text-text-primary truncate">
                          {item.type === 'task' ? item.data.name : item.data.title}
                        </div>
                        <div className="text-[9px] text-text-secondary uppercase tracking-tighter">
                          {item.type} • Deleted {item.deletedAt}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => restoreFromBin(item.id)}
                          className="p-2 bg-purple-500/20 text-purple-400 rounded-lg text-xs"
                          title="Restore"
                        >
                          ♻️
                        </button>
                        <button 
                          onClick={() => permanentDeleteFromBin(item.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg text-xs"
                          title="Delete Permanently"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <button 
                onClick={() => setBinOpen(false)}
                className="w-full py-3 rounded-xl bg-bg-primary border border-border-subtle text-text-primary font-syne font-bold text-sm active:scale-95 transition-transform"
              >
                Close
              </button>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
