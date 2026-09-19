import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { exploreSections } from '@/data/mock'

export function Explore() {
  const navigate = useNavigate()

  return (
    <div className="pb-24">
      <div className="mx-auto max-w-6xl px-6 pt-14 sm:px-8">
        <p className="text-xs tracking-[0.16em] text-midnight/45">EXPLORE</p>
        <h1 className="mt-2 max-w-lg font-serif text-4xl text-midnight sm:text-5xl">
          Go beyond the obvious.
        </h1>
        <p className="mt-4 max-w-md text-midnight/55">
          Places, flavours and experiences worth leaving the main road for.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-6xl px-6 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {exploreSections.map((section, i) => (
            <motion.button
              key={section.id}
              onClick={() => navigate('/place/' + section.id)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: (i % 2) * 0.1 }}
              className={`group relative overflow-hidden rounded-3xl text-left ${
                i === 0 ? 'sm:col-span-2 sm:aspect-[21/9]' : 'aspect-[4/5]'
              }`}
            >
              <motion.img
                src={section.image}
                alt=""
                className="h-full w-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-midnight/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <p className="font-serif text-2xl text-ivory sm:text-3xl">{section.title}</p>
                <p className="mt-1 max-w-xs text-sm text-ivory/70">{section.blurb}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
