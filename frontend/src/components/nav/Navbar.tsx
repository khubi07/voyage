import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { Logo } from '@/components/brand/Logo'

const links = [
  { to: '/', label: 'Home' },
  { to: '/trip', label: 'My Trip' },
  { to: '/concierge', label: 'Concierge' },
  { to: '/explore', label: 'Explore' },
  { to: '/saved', label: 'Saved' },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 hidden border-b border-midnight/8 bg-ivory/85 backdrop-blur-md sm:block">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
        <NavLink to="/">
          <Logo />
        </NavLink>
        <div className="flex items-center gap-8">
          {links.slice(1).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  'text-sm font-medium tracking-tight transition-colors',
                  isActive ? 'text-midnight' : 'text-midnight/50 hover:text-midnight/80'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  )
}
