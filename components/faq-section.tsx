"use client"

import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is RoyalSewa and what do you sell?",
    answer:
      "RoyalSewa is Nepal's leading digital store for subscriptions, gift cards, game top-ups, and software licenses. We offer products like Netflix, Spotify, YouTube Premium, Google Play gift cards, Steam Wallet codes, PlayStation Plus, and more -- all at the most affordable prices for customers in Nepal.",
  },
  {
    question: "How do I receive my product after purchase?",
    answer:
      "All products are delivered digitally. After your payment is confirmed, you will receive your subscription credentials, gift card codes, or activation keys via your RoyalSewa account dashboard and email. Most orders are fulfilled within minutes.",
  },
  {
    question: "What payment methods are accepted in Nepal?",
    answer:
      "We accept eSewa, Khalti, ConnectIPS, bank transfer, and international cards (Visa/Mastercard). Simply choose your preferred method at checkout. All prices are displayed in Nepali Rupees (NPR).",
  },
  {
    question: "Is it safe to buy digital subscriptions from RoyalSewa?",
    answer:
      "Absolutely. RoyalSewa is a trusted and verified digital retailer based in Nepal. All our products are 100% genuine and sourced from authorized channels. We have served thousands of satisfied customers across Nepal.",
  },
  {
    question: "Can I buy Netflix, Spotify, or YouTube Premium from Nepal?",
    answer:
      "Yes! RoyalSewa makes it easy for Nepali customers to access global subscription services. We provide Netflix, Spotify Premium, YouTube Premium, Disney+, Apple Music, and many more with instant activation.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "Since all our products are digital and delivered instantly, refunds are handled on a case-by-case basis. If you face any issue with your product, please contact our support team via WhatsApp at +977 9869671451 or email support@royalsewa.com within 24 hours of purchase.",
  },
  {
    question: "How long do subscription plans last?",
    answer:
      "Subscription durations vary by product. We offer monthly, quarterly, half-yearly, and yearly plans. Each product page displays all available durations and their prices so you can choose the plan that fits your needs and budget.",
  },
  {
    question: "Do you offer discounts for bulk or long-term purchases?",
    answer:
      "Yes, longer duration plans often come with significant discounts. For example, yearly plans can save you up to 40% compared to monthly pricing. We also run seasonal deals and promotions -- check our Deals section regularly.",
  },
]

// FAQPage JSON-LD schema for SEO
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
}

export function FAQSection() {
  return (
    <section className="py-10 bg-background">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
        {/* JSON-LD for crawlers */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-[17px] font-semibold text-foreground text-balance">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Everything you need to know about buying digital products in Nepal
            from RoyalSewa.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b border-border"
              >
                <AccordionTrigger className="text-left text-[14px] text-foreground hover:no-underline hover:text-primary py-4 font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-[13px] pb-4 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
