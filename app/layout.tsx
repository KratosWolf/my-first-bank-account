import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
// import PWAInstaller from '@/components/PWAInstaller'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My First Bank Account - Banco Infantil',
  description: 'Aplicativo de educação financeira para crianças e famílias. Aprenda a poupar, gastar conscientemente e construir um futuro financeiro sólido.',
  keywords: ['educação financeira', 'crianças', 'poupança', 'banco infantil', 'família', 'metas', 'dinheiro'],
  authors: [{ name: 'My First Bank Account Team' }],
  creator: 'My First Bank Account',
  publisher: 'My First Bank Account',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'My First Bank Account',
    title: 'Banco Infantil - Educação Financeira para Crianças',
    description: 'Ensine seus filhos sobre dinheiro de forma divertida e educativa.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'My First Bank Account - Educação Financeira Infantil',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Banco Infantil - Educação Financeira para Crianças',
    description: 'Ensine seus filhos sobre dinheiro de forma divertida e educativa.',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Banco Kids',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#6366f1' },
    { media: '(prefers-color-scheme: dark)', color: '#6366f1' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className}`} style={{ fontSmoothing: 'antialiased', WebkitFontSmoothing: 'antialiased' }} suppressHydrationWarning>
        <Providers>
          <div style={{ minHeight: '100vh', background: '#ffffff' }}>
            {children}
            {/* <PWAInstaller /> */}
          </div>
        </Providers>
      </body>
    </html>
  )
}