import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { CartProvider } from '@/lib/cart-context'
import { Toaster } from '@/components/ui/toaster'
import { BottomNav } from '@/components/bottom-nav'
import { ScrollToTop } from '@/components/scroll-to-top'
import { CartNotification } from '@/components/cart-notification'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#090909",
}

export const metadata: Metadata = {
  title: {
    default: 'Premium Subscriptions Store - Buy Netflix, Spotify & Subscriptions in Nepal | Digital Store Nepal',
    template: '%s | Premium Subscriptions Store Nepal',
  },
  description: 'Nepal\'s #1 trusted digital store. Buy Netflix subscription in Nepal, Spotify Premium, YouTube Premium, game top-ups & software keys. Pay with eSewa, Khalti, ConnectIPS. Instant delivery, best prices in NPR.',
  keywords: [
    'buy netflix in nepal', 'netflix subscription nepal', 'spotify premium nepal',
    'youtube premium nepal', 'digital subscription nepal', 'buy subscription online nepal',
    'esewa payment', 'khalti payment', 'streaming subscription nepal',
    'game top up nepal', 'gift card nepal', 'premium subscriptions store',
    'digital store nepal', 'online subscription nepal', 'software keys nepal',
    'buy hbo max nepal', 'canva pro nepal', 'discord nitro nepal',
    'nepal digital products', 'subscription service nepal',
  ],
  authors: [{ name: 'Premium Subscriptions Store', url: 'https://premiumsubscriptions.com' }],
  creator: 'Premium Subscriptions Store',
  publisher: 'Premium Subscriptions Store',
  metadataBase: new URL('https://premiumsubscriptions.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://premiumsubscriptions.com',
    siteName: 'Premium Subscriptions Store',
    title: 'Premium Subscriptions Store - Buy Netflix, Spotify & Digital Subscriptions in Nepal',
    description: 'Nepal\'s most trusted platform for digital subscriptions. Buy Netflix, Spotify, YouTube Premium & more. Pay with eSewa, Khalti, ConnectIPS. Instant delivery.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premium Subscriptions Store - Digital Subscriptions & Products in Nepal',
    description: 'Buy Netflix, Spotify, YouTube Premium & more in Nepal. Pay with eSewa, Khalti. Instant delivery, best NPR prices.',
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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-NP" className="bg-background">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Premium Subscriptions Store',
              url: 'https://www.premiumsubscriptions.com',
              logo: 'https://www.premiumsubscriptions.com/android-chrome-512x512.png',
              description: "Nepal's trusted digital store for subscriptions, gift cards, game top-ups, and software licenses.",
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Kathmandu',
                addressCountry: 'NP',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+977-9746334202',
                email: 'support@premiumsubscriptions.com',
                contactType: 'customer service',
                availableLanguage: ['English', 'Nepali'],
              },
              sameAs: [],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Premium Subscriptions Store',
              url: 'https://www.premiumsubscriptions.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://www.premiumsubscriptions.com/search?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <AuthProvider>
          <CartProvider>
            <ScrollToTop />
            {children}
            <BottomNav />
            <CartNotification />
          </CartProvider>
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
