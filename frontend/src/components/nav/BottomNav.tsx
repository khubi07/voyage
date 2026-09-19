import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { Home, MapPinned, Sparkles, Compass } from 'lucide-react'

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/trip', label: 'Trip', icon: MapPinned },
  { to: '/concierge', label: 'Concierge', icon: Sparkles },
  { to: '/explore', label: 'Explore', icon: Compass },
]

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-midnight/8 bg-ivory/95 backdrop-blur-md sm:hidden">
      <div className="flex items-center justify-around px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-[11px] font-medium transition-colors',
                  isActive ? 'text-terracotta' : 'text-midnight/45'
                )
              }
            >
              <Icon size={20} strokeWidth={2} />
              {link.label}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
