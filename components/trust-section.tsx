"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import Link from "next/link"

const reviews = [
  {
    rating: 5,
    title: "Best way to buy first few btc",
    content: "A few months ago I was buying my first few btc using coingate and I had issues with the amounts sent. I contact support quickly and they responded super fast and solved my issue.",
    author: "Scott M Bilodeau",
    platform: "Trustpilot"
  },
  {
    rating: 5,
    title: "I recommend this site",
    content: "I recommend this site. They had so much to choose from and the service was super fast. I got my gift card in seconds after payment was confirmed.",
    author: "Tim Raiger",
    platform: "Trustpilot"
  },
  {
    rating: 5,
    title: "So Smooth",
    content: "My payment went out in a glimpse. I love gift cards and this company gave me the fastest service ever. Highly recommend to anyone looking for quick delivery.",
    author: "Ranaswale",
    platform: "Trustpilot"
  },
]

export function TrustSection() {
  return (
    <section className="py-10 bg-background">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-[20px] font-semibold text-foreground mb-1">
            We provide the <span className="text-primary">safest platform</span> to buy gift cards online
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Trusted globally for safe and hassle-free gift card shopping
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              whileHover={{ y: -2 }}
              className="border border-border rounded-xl p-5 bg-card hover:border-primary/30 transition-colors duration-300"
            >
              <div className="flex items-center gap-0.5 mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <h4 className="font-semibold text-[14px] text-foreground mb-2">{review.title}</h4>
              <p className="text-muted-foreground text-[13px] leading-relaxed mb-4 line-clamp-3">{review.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-foreground">{review.author}</span>
                <span className="text-[11px] text-muted-foreground">{review.platform}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <Link href="#" className="text-primary text-[13px] font-medium hover:underline">
          View all reviews &rarr;
        </Link>
      </div>
    </section>
  )
}
