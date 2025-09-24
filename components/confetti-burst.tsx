'use client'

import { useEffect, useRef } from 'react'

type ConfettiBurstProps = {
  active: boolean
  onDone?: () => void
}

// Lightweight CSS-based confetti (no external deps)
export default function ConfettiBurst({ active, onDone }: ConfettiBurstProps) {
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) return
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => onDone?.(), 1500)
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [active, onDone])

  if (!active) return null

  const pieces = new Array(24).fill(0)

  return (
    <div className="pointer-events-none fixed inset-0 z-[1000] overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {pieces.map((_, i) => (
          <span
            key={i}
            className="absolute w-2 h-3 rounded-sm animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: COLORS[i % COLORS.length],
              animationDelay: `${Math.random() * 200}ms`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes confettiFall {
          0% { opacity: 0; transform: translateY(-20px) scale(0.8) rotate(0deg); }
          10% { opacity: 1; }
          100% { opacity: 0; transform: translateY(60vh) scale(1) rotate(720deg); }
        }
        .animate-confetti { animation: confettiFall 1.2s ease-out forwards; }
      `}</style>
    </div>
  )
}

const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444']


