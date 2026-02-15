"use client"

import { motion } from "framer-motion"
import { Shield, Zap, Headphones, CreditCard, BadgeCheck, Globe } from "lucide-react"

const reasons = [
  {
    icon: Zap,
    title: "Instant Digital Delivery",
    description: "Get your subscription codes and product keys delivered instantly to your email after payment confirmation. No waiting, no delays.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Shield,
    title: "100% Secure Payments",
    description: "Pay safely with eSewa, Khalti, ConnectIPS, or Internet Banking. All transactions are encrypted and verified for your security.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: BadgeCheck,
    title: "Genuine & Verified Products",
    description: "Every subscription and product key is sourced from authorized distributors. We guarantee authenticity on every purchase.",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
  },
  {
    icon: CreditCard,
    title: "Nepal-Friendly Pricing",
    description: "Affordable prices in NPR with no hidden fees. Buy Netflix, Spotify, YouTube Premium and more at the best rates in Nepal.",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    icon: Headphones,
    title: "Dedicated Customer Support",
    description: "Our Nepal-based support team is available to help you with any questions or issues. Get assistance in Nepali or English.",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    icon: Globe,
    title: "Wide Range of Products",
    description: "From streaming subscriptions to game top-ups and software keys, find everything you need in one place. Nepal's one-stop digital store.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
]

export function WhyChooseSection() {
  return (
    <section className="py-10 sm:py-14 bg-background">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="text-center mb-8 sm:mb-10"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-foreground text-balance">
            Why Choose <span className="text-primary">Premium Subscriptions</span>?
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto text-pretty">
            Nepal's most trusted platform for digital subscriptions, streaming services, game top-ups, and software keys.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reasons.map((reason, index) => {
            const Icon = reason.icon
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
                className="group border border-border rounded-xl p-5 bg-card hover:border-primary/30 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-lg ${reason.bgColor} flex items-center justify-center mb-3.5 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={`w-5 h-5 ${reason.color}`} />
                </div>
                <h3 className="text-[14px] font-semibold text-foreground mb-1.5">{reason.title}</h3>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed">{reason.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
