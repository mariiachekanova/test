import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Breadcrumb } from '@/components/breadcrumb'
import { Shield, Zap, Users, Globe, Heart, Award, Tv, Music, Gamepad2, Code } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us - Premium Subscriptions Store | Nepal\'s #1 Digital Subscription Provider',
  description: 'Premium Subscriptions Store is Nepal\'s leading digital subscription provider. Buy Netflix, Spotify, YouTube Premium, game top-ups & software in Nepal. Pay with eSewa, Khalti, ConnectIPS. Instant delivery, best NPR prices.',
  keywords: ['digital subscription nepal', 'buy netflix nepal', 'spotify premium nepal', 'nepal digital store', 'premium subscriptions store about', 'online subscription provider nepal'],
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Premium Subscriptions Store - Nepal\'s #1 Digital Subscription Provider',
    description: 'Nepal\'s most trusted platform for digital subscriptions, gift cards, and game top-ups. Serving 50,000+ customers across Nepal.',
    url: 'https://www.premiumsubscriptions.com/about',
  },
}

const values = [
  { icon: Zap, title: 'Instant Delivery', desc: 'Digital codes delivered to your inbox within seconds of payment confirmation. No waiting, no delays.' },
  { icon: Shield, title: '100% Genuine Products', desc: 'Every subscription and gift card is sourced directly from official distributors and publishers.' },
  { icon: Users, title: 'Customer First', desc: 'Our dedicated Kathmandu-based support team is available to help you with any issues.' },
  { icon: Globe, title: 'Made for Nepal', desc: 'We support eSewa, Khalti, ConnectIPS, bank transfers, and pricing in Nepali Rupees (NPR).' },
  { icon: Heart, title: 'Trusted by 50,000+', desc: 'Over 50,000 satisfied customers across Nepal trust Premium Subscriptions Store for their digital needs.' },
  { icon: Award, title: 'Best Prices in Nepal', desc: 'We offer the most competitive prices on digital subscriptions with regular discounts and offers.' },
]

const services = [
  { icon: Tv, title: 'Streaming Subscriptions', desc: 'Netflix, Spotify, YouTube Premium, HBO Max, Disney+, Apple TV+, and more -- all available at the best prices in Nepal.', examples: 'Netflix Premium, Spotify Family, YouTube Premium' },
  { icon: Music, title: 'Digital Gift Cards', desc: 'Gift cards for popular platforms delivered instantly. Perfect for gifting or personal use with local Nepali payment methods.', examples: 'Amazon, Google Play, Apple iTunes, Steam' },
  { icon: Gamepad2, title: 'Game Top-Ups & Keys', desc: 'Level up your gaming with wallet codes, in-game currency, and game keys from the biggest gaming platforms.', examples: 'Steam Wallet, PlayStation, Xbox, PUBG UC' },
  { icon: Code, title: 'Software & Tools', desc: 'Professional software licenses and subscriptions for students, freelancers, and businesses in Nepal.', examples: 'Canva Pro, Microsoft 365, Adobe Creative Cloud' },
]

const stats = [
  { value: '50,000+', label: 'Customers Served' },
  { value: '500+', label: 'Products Available' },
  { value: '99.9%', label: 'Delivery Success Rate' },
  { value: '24/7', label: 'Customer Support' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Breadcrumb items={[{ label: 'About Us' }]} />

        <div className="mt-6 space-y-10">
          {/* Hero */}
          <section className="text-center space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-balance">
              Nepal&apos;s <span className="text-primary">#1 Digital Subscription</span> Provider
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto text-pretty">
              Premium Subscriptions Store is Nepal&apos;s leading digital marketplace for streaming subscriptions, gift cards, game top-ups, and software licenses. We make it easy for Nepali consumers to access the world&apos;s best digital services with local payment options and instant delivery.
            </p>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-card rounded-xl border border-border/60 p-4 text-center">
                <p className="text-xl sm:text-2xl font-bold text-primary">{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </section>

          {/* Story */}
          <section className="bg-card rounded-xl border border-border/60 p-5 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-foreground">Our Story</h2>
            <div className="space-y-3 text-[13px] text-muted-foreground leading-relaxed">
              <p>
                Founded in Nepal, Premium Subscriptions Store was born out of a simple frustration: buying digital subscriptions like Netflix, Spotify, or YouTube Premium was unnecessarily complicated for Nepali users. International payment barriers, inflated prices from third-party resellers, and unreliable delivery made it nearly impossible for people in Nepal to access the digital services the rest of the world enjoys effortlessly.
              </p>
              <p>
                We set out to change that. By partnering directly with publishers and distributors, integrating Nepal&apos;s most popular payment gateways -- eSewa, Khalti, and ConnectIPS -- and building a platform specifically designed for Nepali users, we&apos;ve made buying digital subscriptions as simple as ordering from your favourite local store.
              </p>
              <p>
                Today, Premium Subscriptions Store is Nepal&apos;s most trusted digital subscription provider, serving over 50,000 customers across all 77 districts. From Kathmandu to Pokhara, Biratnagar to Dhangadhi, we deliver instant digital codes for streaming services, gift cards, game top-ups, and professional software -- all at the best prices in Nepali Rupees.
              </p>
            </div>
          </section>

          {/* What We Offer */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-foreground text-center">What We Offer in Nepal</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((s) => (
                <div key={s.title} className="bg-card rounded-xl border border-border/60 p-4 sm:p-5 space-y-2 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <s.icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <h3 className="text-[13px] font-semibold text-foreground">{s.title}</h3>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
                  <p className="text-[10px] text-primary/80 font-medium">Popular: {s.examples}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Mission */}
          <section className="bg-card rounded-xl border border-border/60 p-5 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-foreground">Our Mission</h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              To make every digital product, subscription, and service accessible, affordable, and instantly available to every person in Nepal -- removing international payment barriers and delivering a seamless, trustworthy experience through local payment methods like eSewa, Khalti, and ConnectIPS.
            </p>
          </section>

          {/* Why Trust Us */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-foreground text-center">Why Nepali Customers Trust Us</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {values.map((v) => (
                <div key={v.title} className="bg-card rounded-xl border border-border/60 p-4 flex gap-3 items-start hover:border-primary/30 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <v.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-semibold text-foreground mb-0.5">{v.title}</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact CTA */}
          <section className="bg-primary/5 border border-primary/20 rounded-xl p-5 sm:p-8 text-center space-y-3">
            <h2 className="text-lg font-bold text-foreground">Have Questions?</h2>
            <p className="text-[13px] text-muted-foreground">
              Our Kathmandu-based team is here to help. Reach us anytime.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-[13px]">
              <a href="https://wa.me/9779746334202" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">WhatsApp: +977 9746334202</a>
              <span className="hidden sm:inline text-border">|</span>
              <a href="mailto:support@premiumsubscriptions.com" className="text-primary font-semibold hover:underline">support@premiumsubscriptions.com</a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
