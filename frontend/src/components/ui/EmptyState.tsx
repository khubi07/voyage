import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

interface EmptyStateProps {
  heading: string
  body?: string
  action?: ReactNode
}

export function EmptyState({ heading, body, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center gap-4 py-20 text-center"
    >
      <p className="max-w-xs font-serif text-2xl text-midnight">{heading}</p>
      {body && <p className="max-w-xs text-sm text-midnight/55">{body}</p>}
      {action}
    </motion.div>
  )
}
