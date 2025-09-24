'use client'

import { useI18n, type LanguageCode } from '@/components/i18n-provider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const labels: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'हिंदी',
  gu: 'ગુજરાતી',
}

const shortLabels: Record<LanguageCode, string> = {
  en: 'Eng',
  hi: 'हिं',
  gu: 'ગુજ',
}

export function LanguageSelect({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useI18n()

  return (
    <Select value={language} onValueChange={(val) => setLanguage(val as LanguageCode)}>
      <SelectTrigger className={compact ? 'h-8 w-[96px] text-xs' : 'w-[160px]'} aria-label="Select language">
        <SelectValue placeholder="Lang">
          {shortLabels[language]}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="en">{labels.en}</SelectItem>
        <SelectItem value="hi">{labels.hi}</SelectItem>
        <SelectItem value="gu">{labels.gu}</SelectItem>
      </SelectContent>
    </Select>
  )
}


