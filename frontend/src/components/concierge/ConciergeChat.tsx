import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { sendChatMessage } from '@/api/client'
import type { ChatMessage, TripContext } from '@/types/trip'
import { CompassMark } from '@/components/brand/CompassMark'
import { LoadingState } from '@/components/ui/LoadingState'
import { RecommendationCard } from '@/components/place/RecommendationCard'
import { WeatherAlert } from '@/components/trip/WeatherAlert'

const THINKING_MESSAGES = [
  'Reading your trip\u2026',
  'Finding places that fit\u2026',
  'Putting together an answer\u2026',
]

const SUGGESTED_PROMPTS = [
  'What should we do tonight?',
  'Find somewhere quiet for dinner',
  'Make tomorrow more adventurous',
  'What if it rains tomorrow?',
]

interface ConciergeChatProps {
  tripId: number
  trip: TripContext
  initialMessages?: ChatMessage[]
  initialQuery?: string | null
}

export function ConciergeChat({
  tripId,
  trip,
  initialMessages = [],
  initialQuery,
}: ConciergeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSend(text?: string) {
    const query = (text ?? input).trim()
    if (!query) return

    const guestMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'guest',
      text: query,
      timestamp: Date.now(),
    }
    setMessages((m) => [...m, guestMessage])
    setInput('')
    setThinking(true)

    const response = await sendChatMessage(tripId, query)
    setThinking(false)
    setMessages((m) => [
      ...m,
      {
        id: crypto.randomUUID(),
        role: 'voyage',
        text: response.message,
        recommendations: response.recommendations,
        action: response.action,
        needsConfirmation: response.needs_confirmation,
        timestamp: Date.now(),
      },
    ])
  }

  const affectedItem = trip.itinerary.find(
  (i) => i.title === 'Calangute Beach'
)

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto px-1 py-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <CompassMark size={30} className="text-teal" />
            <p className="max-w-xs font-serif text-xl text-midnight/70">
              Tell VOYAGE what you need.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={msg.role === 'guest' ? 'flex justify-end' : 'flex justify-start'}
            >
              {msg.role === 'guest' ? (
                <div className="max-w-[80%] rounded-2xl rounded-br-md bg-midnight px-4 py-2.5 text-sm text-ivory">
                  {msg.text}
                </div>
              ) : (
                <div className="max-w-[92%] sm:max-w-[80%]">
                  <div className="mb-2 flex items-center gap-2">
                    <CompassMark size={16} className="text-teal" />
                    <span className="text-xs font-medium tracking-tight text-midnight/50">
                      VOYAGE
                    </span>
                  </div>
                  <p className="font-serif text-lg leading-snug text-midnight">{msg.text}</p>

                  {msg.action === 'SUGGEST_ITINERARY_CHANGE' && affectedItem ? (
                    <div className="mt-4">
                      <WeatherAlert
                        affectedItem={affectedItem}
                        alternatives={msg.recommendations ?? []}
                        message={msg.text}
                      />
                    </div>
                  ) : msg.recommendations && msg.recommendations.length > 0 ? (
                    <div className="mt-4 flex gap-4 overflow-x-auto rail pb-2">
                      {msg.recommendations.map((rec, i) => (
                        <RecommendationCard key={rec.name} place={rec} index={i} />
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {thinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 pl-1"
          >
            <LoadingState messages={THINKING_MESSAGES} />
          </motion.div>
        )}
      </div>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 px-1 pb-4">
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <motion.button
              key={prompt}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              onClick={() => handleSend(prompt)}
              className="rounded-full border border-midnight/15 px-3.5 py-1.5 text-xs text-midnight/70 transition-colors hover:border-midnight/30 hover:text-midnight"
            >
              {prompt}
            </motion.button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 rounded-full border border-midnight/12 bg-white/60 px-2 py-2 pl-5 shadow-sm">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="What do you feel like doing?"
          className="flex-1 bg-transparent text-sm text-midnight placeholder:text-midnight/35 focus:outline-none"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSend()}
          disabled={!input.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta text-ivory transition-opacity disabled:opacity-30"
          aria-label="Send"
        >
          <ArrowUp size={16} />
        </motion.button>
      </div>
    </div>
  )
}
