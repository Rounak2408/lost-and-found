'use client'

import { useState, useEffect } from 'react'

interface DashboardActionAnimationProps {
  isAnimating: boolean
  animationType: 'found' | 'lost' | null
}

export default function DashboardActionAnimation({ isAnimating, animationType }: DashboardActionAnimationProps) {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    size: number
    color: string
    speed: number
    direction: number
  }>>([])

  useEffect(() => {
    if (isAnimating) {
      // Create floating particles around the action cards
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 3 + 1,
        color: animationType === 'found' 
          ? `hsl(${Math.random() * 40 + 120}, 80%, 60%)` // Green tones for found
          : `hsl(${Math.random() * 40 + 200}, 80%, 60%)`, // Blue tones for lost
        speed: Math.random() * 1.5 + 0.3,
        direction: Math.random() * Math.PI * 2
      }))
      setParticles(newParticles)

      // Animate particles
      const animate = () => {
        setParticles(prev => prev.map(particle => ({
          ...particle,
          x: particle.x + Math.cos(particle.direction) * particle.speed,
          y: particle.y + Math.sin(particle.direction) * particle.speed,
          direction: particle.direction + 0.005
        })))
      }

      const interval = setInterval(animate, 50)
      
      // Stop animation after 2 seconds
      const timeout = setTimeout(() => {
        clearInterval(interval)
        setParticles([])
      }, 2000)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [isAnimating, animationType])

  if (!isAnimating) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Floating particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-pulse particle-float"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`
          }}
        />
      ))}
      
      {/* Success/Info icons floating around */}
      <div className="absolute inset-0">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className={`absolute text-3xl opacity-30 animate-bounce floating-icon-${i}`}
          >
            {animationType === 'found' ? '🎉' : '🔍'}
          </div>
        ))}
      </div>
      
      {/* Celebration effect for found items */}
      {animationType === 'found' && (
        <div className="absolute inset-0">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={`celebration-${i}`}
              className="absolute text-4xl opacity-40 animate-ping celebration-effect"
              style={{
                left: `${20 + i * 20}%`,
                top: `${30 + i * 15}%`,
                animationDelay: `${i * 0.3}s`
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}
      
      {/* Search effect for lost items */}
      {animationType === 'lost' && (
        <div className="absolute inset-0">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={`search-${i}`}
              className="absolute text-3xl opacity-30 animate-pulse search-effect"
              style={{
                left: `${30 + i * 25}%`,
                top: `${40 + i * 10}%`,
                animationDelay: `${i * 0.5}s`
              }}
            >
              🔍
            </div>
          ))}
        </div>
      )}
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        
        .particle-float {
          animation: float 2s ease-in-out infinite;
        }
        
        .floating-icon-0 { left: 15%; top: 25%; animation-delay: 0s; animation-duration: 2s; }
        .floating-icon-1 { left: 35%; top: 15%; animation-delay: 0.3s; animation-duration: 2.5s; }
        .floating-icon-2 { left: 55%; top: 30%; animation-delay: 0.6s; animation-duration: 2.2s; }
        .floating-icon-3 { left: 75%; top: 20%; animation-delay: 0.9s; animation-duration: 2.8s; }
        .floating-icon-4 { left: 25%; top: 60%; animation-delay: 0.2s; animation-duration: 2.3s; }
        .floating-icon-5 { left: 85%; top: 70%; animation-delay: 0.7s; animation-duration: 2.6s; }
      `}</style>
    </div>
  )
}
