import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import AnalyticsClient from "@/components/analytics-client"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { I18nProvider } from "@/components/i18n-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import "./globals.css"

export const metadata: Metadata = {
  title: "SmartFind - Lost & Found Management System",
  description:
    "AI-powered lost and found platform that helps reunite people with their belongings through smart matching technology.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <I18nProvider>
            <ErrorBoundary>
              <Suspense fallback={null}>{children}</Suspense>
            </ErrorBoundary>
            <AnalyticsClient />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
