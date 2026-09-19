import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CompassMark } from '@/components/brand/CompassMark'

interface LoadingStateProps {
  messages: string[]
  intervalMs?: number
  className?: string
}

// Cycles through contextual "the AI is working" copy rather than a generic
// spinner, per the brief. Stops advancing on the last message and holds
// there until the parent unmounts this (i.e. the real response arrived).
export function LoadingState({ messages, intervalMs = 1100, className }: LoadingStateProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index >= messages.length - 1) return
    const t = setTimeout(() => setIndex((i) => i + 1), intervalMs)
    return () => clearTimeout(t)
  }, [index, messages.length, intervalMs])

  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
        className="text-teal"
      >
        <CompassMark size={22} />
      </motion.div>
      <div className="relative h-5 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="block text-sm text-midnight/60"
          >
            {messages[index]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}
