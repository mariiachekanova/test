import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { DealsSection } from "@/components/deals-section"
import { GiftCardsSection } from "@/components/gift-cards-section"
import { WhyChooseSection } from "@/components/why-choose-section"
import { CategoriesSection } from "@/components/categories-section"
import { BrandsSection } from "@/components/brands-section"
import { BlogSection } from "@/components/blog-section"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Premium Subscriptions Store - Buy Netflix, Spotify, Gift Cards & Game Top-Ups in Nepal",
  description:
    "Nepal's #1 digital store. Buy Netflix, Spotify Premium, YouTube Premium, Google Play gift cards, Steam Wallet codes, PlayStation Plus, and more at the best prices in Nepal. Instant delivery via eSewa, Khalti, ConnectIPS.",
  keywords: [
    "buy netflix nepal",
    "spotify premium nepal",
    "youtube premium nepal",
    "gift cards nepal",
    "google play gift card nepal",
    "steam wallet nepal",
    "game top up nepal",
    "digital subscriptions nepal",
    "premium subscriptions store",
    "esewa gift card",
    "playstation plus nepal",
    "xbox game pass nepal",
  ],
  alternates: { canonical: "https://www.premiumsubscriptions.store" },
  openGraph: {
    title: "Premium Subscriptions Store - Buy Netflix, Spotify, Gift Cards & Game Top-Ups in Nepal",
    description:
      "Nepal's #1 digital store for subscriptions, gift cards, and game top-ups. Instant delivery. Pay with eSewa, Khalti, or bank transfer.",
    url: "https://www.premiumsubscriptions.store",
    siteName: "Premium Subscriptions Store",
    type: "website",
    locale: "en_NP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Subscriptions Store - Digital Subscriptions & Gift Cards in Nepal",
    description:
      "Buy Netflix, Spotify, Google Play gift cards, Steam Wallet and more in Nepal at the best prices.",
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <DealsSection />
        {/* Product sections: Subscriptions -> Gift Cards -> Games */}
        <GiftCardsSection />
        <CategoriesSection />
        <WhyChooseSection />
        <BrandsSection />
        <BlogSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}
