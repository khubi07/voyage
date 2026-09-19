import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from '@/components/nav/Navbar'
import { BottomNav } from '@/components/nav/BottomNav'

export function Layout() {
  const location = useLocation()
  const isConcierge = location.pathname === '/concierge'

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={isConcierge ? '' : 'pb-20 sm:pb-0'}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <BottomNav />
    </div>
  )
}
