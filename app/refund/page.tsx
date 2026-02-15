import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Breadcrumb } from '@/components/breadcrumb'
import { AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Understand the refund and cancellation policy for digital products purchased on Premium Subscriptions Store, Nepal\'s trusted digital store.',
  alternates: { canonical: '/refund' },
}

const sections = [
  {
    title: '1. Digital Product Nature',
    content: 'All products sold on Premium Subscriptions Store are digital goods (subscription codes, gift cards, game top-ups, software keys). Due to the instant and irrevocable nature of digital product delivery, all sales are generally considered final once the product code has been revealed or delivered.',
  },
  {
    title: '2. Eligible Refund Cases',
    content: 'We will process a full refund in the following cases: you received a product code that is invalid, already redeemed, or non-functional; a technical error on our platform prevented successful delivery; you were charged but did not receive any product; a duplicate charge occurred for the same order. You must contact us within 48 hours of purchase with your order ID and proof of the issue.',
  },
  {
    title: '3. Non-Refundable Cases',
    content: 'Refunds will not be issued in the following cases: the product code has been successfully redeemed or activated; you changed your mind after purchase; you purchased the wrong product (please double-check before ordering); the product was purchased using a promotional or discounted price; the issue is with the third-party service provider (e.g., Netflix account issues) and not with the code itself.',
  },
  {
    title: '4. How to Request a Refund',
    content: 'To request a refund: email us at support@premiumsubscriptions.com with your order ID, registered email, and a description of the issue; our team will investigate and respond within 24-48 hours; if approved, refunds will be processed to your original payment method within 5-7 business days; alternatively, you may opt for store credit which is processed instantly.',
  },
  {
    title: '5. Refund Method',
    content: 'Approved refunds will be returned to the original payment method used (eSewa, Khalti, ConnectIPS, etc.). Processing times depend on the payment provider and may take 3-7 business days. Premium Subscriptions Store store credit is an alternative option and is processed immediately.',
  },
  {
    title: '6. Order Cancellation',
    content: 'Orders for digital products cannot be cancelled once the product code has been generated and delivered. If your order is stuck in "processing" status for more than 30 minutes, please contact support for assistance.',
  },
  {
    title: '7. Disputes',
    content: 'If you are not satisfied with our refund decision, you may escalate the matter by emailing support@premiumsubscriptions.com with the subject "Refund Dispute" and your order details. We will review your case within 48 hours and provide a final decision.',
  },
  {
    title: '8. Contact',
    content: 'For all refund-related queries, reach us at support@premiumsubscriptions.com or through our Contact page. Our support team operates Sun-Fri, 10 AM - 6 PM NPT.',
  },
]

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Breadcrumb items={[{ label: 'Refund Policy' }]} />
        <div className="mt-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Refund Policy</h1>
            <p className="text-[12px] text-muted-foreground">Last updated: February 2026</p>
          </div>

          {/* Important notice */}
          <div className="flex gap-3 items-start bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-foreground mb-0.5">Important Notice</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                All digital products are delivered instantly and are generally non-refundable once the code has been revealed. Please verify your order carefully before completing payment. Need help? <Link href="/contact" className="text-primary hover:underline">Contact us</Link>.
              </p>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border/60 p-5 sm:p-8 space-y-6">
            {sections.map((s) => (
              <section key={s.title} className="space-y-1.5">
                <h2 className="text-[14px] font-bold text-foreground">{s.title}</h2>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{s.content}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
