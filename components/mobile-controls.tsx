'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { LanguageSelect } from '@/components/language-select'

export function MobileControls() {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
    <div className="fixed bottom-6 right-6 z-50 sm:hidden">
      <div className="flex flex-col items-end gap-3">
        {/* Expanded Controls */}
        {isExpanded && (
          <div className="rounded-2xl p-[2px] shadow-2xl animated-gradient w-[164px]">
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl border border-gray-300/60 dark:border-gray-700/50 p-2 flex flex-col items-stretch gap-2 transition-all duration-300 ease-out w-[160px]">
              {/* Theme Switcher */}
              <div className="flex items-center bg-gray-100/90 dark:bg-gray-800/60 border border-gray-300/80 dark:border-gray-700 rounded-lg p-1">
                <ThemeSwitcher />
              </div>

              {/* Language Selector */}
              <div className="min-w-0 bg-gray-100/90 dark:bg-gray-800/60 border border-gray-300/80 dark:border-gray-700 rounded-lg p-1">
                <LanguageSelect compact />
              </div>
            </div>
          </div>
        )}
        
        {/* Trigger Button */}
        <button
          onClick={toggleExpanded}
          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-full shadow-2xl border border-gray-300/60 dark:border-gray-700/50 p-2.5 hover:shadow-2xl transition-all duration-300 ease-out hover:scale-105"
          aria-label="Toggle controls"
        >
          <Plus className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>
    </div>
    <style jsx>{`
      .animated-gradient {
        background: linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981, #f59e0b, #ef4444, #8b5cf6);
        background-size: 400% 100%;
        animation: gradient-move 6s linear infinite;
      }
      @keyframes gradient-move {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }
    `}</style>
    </>
  )
}
