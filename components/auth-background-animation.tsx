'use client'

import { useEffect, useState } from 'react'

interface AuthBackgroundAnimationProps {
  isAnimating: boolean
  animationType: 'signup' | 'signin' | null
}

export default function AuthBackgroundAnimation({ isAnimating, animationType }: AuthBackgroundAnimationProps) {
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
      // Create floating particles
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 4 + 2,
        color: animationType === 'signup' 
          ? `hsl(${Math.random() * 60 + 200}, 70%, 60%)` // Blue tones for signup
          : `hsl(${Math.random() * 60 + 280}, 70%, 60%)`, // Purple tones for signin
        speed: Math.random() * 2 + 0.5,
        direction: Math.random() * Math.PI * 2
      }))
      setParticles(newParticles)

      // Animate particles
      const animate = () => {
        setParticles(prev => prev.map(particle => ({
          ...particle,
          x: particle.x + Math.cos(particle.direction) * particle.speed,
          y: particle.y + Math.sin(particle.direction) * particle.speed,
          direction: particle.direction + 0.01
        })))
      }

      const interval = setInterval(animate, 50)
      
      // Stop animation after 3 seconds
      const timeout = setTimeout(() => {
        clearInterval(interval)
        setParticles([])
      }, 3000)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [isAnimating, animationType])

  if (!isAnimating) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Gradient overlay */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ${
          animationType === 'signup' 
            ? 'bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20'
            : 'bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-indigo-500/20'
        }`}
      />
      
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
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
          }}
        />
      ))}
      
      {/* Pulsing circles */}
      <div className="absolute inset-0">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className={`absolute rounded-full animate-ping pulse-circle-${i} ${
              animationType === 'signup' ? 'bg-blue-400/30' : 'bg-purple-400/30'
            }`}
          />
        ))}
      </div>
      
      {/* Floating icons */}
      <div className="absolute inset-0">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className={`absolute text-4xl opacity-20 animate-bounce floating-icon-${i}`}
          >
            {animationType === 'signup' ? '🔍' : '✨'}
          </div>
        ))}
      </div>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .particle-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .pulse-circle-0 {
          width: 200px;
          height: 200px;
          left: 20%;
          top: 10%;
          animation-delay: 0s;
          animation-duration: 2s;
        }
        
        .pulse-circle-1 {
          width: 300px;
          height: 300px;
          left: 50%;
          top: 30%;
          animation-delay: 0.5s;
          animation-duration: 2s;
        }
        
        .pulse-circle-2 {
          width: 400px;
          height: 400px;
          left: 80%;
          top: 50%;
          animation-delay: 1s;
          animation-duration: 2s;
        }
        
        .floating-icon-0 { left: 10%; top: 20%; animation-delay: 0s; animation-duration: 2s; }
        .floating-icon-1 { left: 30%; top: 10%; animation-delay: 0.5s; animation-duration: 3s; }
        .floating-icon-2 { left: 50%; top: 30%; animation-delay: 1s; animation-duration: 2.5s; }
        .floating-icon-3 { left: 70%; top: 15%; animation-delay: 1.5s; animation-duration: 3.5s; }
        .floating-icon-4 { left: 90%; top: 25%; animation-delay: 0.3s; animation-duration: 2.8s; }
        .floating-icon-5 { left: 15%; top: 60%; animation-delay: 0.8s; animation-duration: 3.2s; }
        .floating-icon-6 { left: 40%; top: 70%; animation-delay: 1.2s; animation-duration: 2.2s; }
        .floating-icon-7 { left: 80%; top: 80%; animation-delay: 0.7s; animation-duration: 3.8s; }
      `}</style>
    </div>
  )
}
