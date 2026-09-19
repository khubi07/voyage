import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface TabsProps {
  tabs: { id: string; label: string }[]
  active: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={clsx('flex items-center gap-1 border-b border-midnight/10', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'relative px-4 py-3 text-sm font-medium tracking-tight transition-colors',
            active === tab.id ? 'text-midnight' : 'text-midnight/45 hover:text-midnight/70'
          )}
        >
          {tab.label}
          {active === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute left-4 right-4 -bottom-px h-[2px] bg-terracotta"
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            />
          )}
        </button>
      ))}
    </div>
  )
}
