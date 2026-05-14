import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PostHogProvider } from '@/providers/posthog-provider'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'FlowMind — Project Management with AI',
  description: 'Manage projects, tasks, and your team with an AI-powered assistant.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#FAFAFA] text-[#09090B]">
        <PostHogProvider>
          <TooltipProvider delay={200}>
            {children}
          </TooltipProvider>
          <Toaster position="bottom-right" />
        </PostHogProvider>
      </body>
    </html>
  )
}
