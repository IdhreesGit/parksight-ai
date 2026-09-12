import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ParkSight AI — Smart Parking Intelligence',
  description:
    'ParkSight AI turns any parking structure into a real-time, AI-guided experience. Live occupancy, computer-vision space detection, and intelligent spot recommendations.',
  generator: 'v0.app',
  keywords: ['smart parking', 'AI parking', 'computer vision', 'occupancy detection', 'ParkSight'],
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#060b1a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
