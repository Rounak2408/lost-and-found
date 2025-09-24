'use client'

import { Globe } from 'lucide-react'
import { useI18n, type LanguageCode } from './i18n-provider'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const labels: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'हिंदी',
  gu: 'ગુજરાતી',
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" /> {labels[language]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        {(Object.keys(labels) as LanguageCode[]).map((code) => (
          <DropdownMenuItem key={code} onClick={() => setLanguage(code)}>
            {labels[code]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


