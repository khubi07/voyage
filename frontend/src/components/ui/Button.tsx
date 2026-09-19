import { motion, type HTMLMotionProps } from 'framer-motion'
import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline-light'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  size?: Size
  children: React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-terracotta text-ivory hover:bg-terracotta-deep focus-visible:ring-terracotta',
  secondary:
    'bg-midnight text-ivory hover:bg-midnight-2 focus-visible:ring-midnight',
  ghost:
    'bg-transparent text-midnight hover:bg-midnight/5 focus-visible:ring-midnight',
  'outline-light':
    'bg-transparent text-ivory border border-ivory/40 hover:bg-ivory/10 focus-visible:ring-ivory',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-xs px-3.5 py-2 gap-1.5',
  md: 'text-sm px-5 py-2.5 gap-2',
  lg: 'text-base px-7 py-3.5 gap-2.5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={clsx(
        'inline-flex items-center justify-center rounded-full font-medium tracking-tight',
        'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-40 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
