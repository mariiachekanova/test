import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Breadcrumb } from '@/components/breadcrumb'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Read the terms and conditions for using Premium Subscriptions Store, Nepal\'s digital product marketplace.',
  alternates: { canonical: '/terms' },
}

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: 'By accessing and using Premium Subscriptions Store (www.premiumsubscriptions.com), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services. These terms apply to all users of the site, including browsers, customers, and contributors of content.',
  },
  {
    title: '2. Services',
    content: 'Premium Subscriptions Store is a digital marketplace based in Nepal that sells digital products including but not limited to: streaming subscriptions (Netflix, Spotify, YouTube Premium, etc.), gift cards, game top-ups, software licenses, and other digital goods. All products are delivered digitally via email or through your Premium Subscriptions Store account.',
  },
  {
    title: '3. Account Registration',
    content: 'To make a purchase, you must create an account with a valid email address and password. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.',
  },
  {
    title: '4. Pricing and Payment',
    content: 'All prices on Premium Subscriptions Store are listed in Nepalese Rupees (NPR). We accept payments through eSewa, Khalti, ConnectIPS, and other supported payment methods. Prices are subject to change without notice. Payment must be completed in full before digital products are delivered.',
  },
  {
    title: '5. Digital Product Delivery',
    content: 'Digital products are delivered instantly after successful payment confirmation. Delivery is made via email and/or your Premium Subscriptions Store account dashboard. In rare cases of system delays, delivery may take up to 24 hours. If you have not received your product within 24 hours, please contact our support team.',
  },
  {
    title: '6. Intellectual Property',
    content: 'All content on Premium Subscriptions Store, including text, graphics, logos, and software, is the property of Premium Subscriptions Store or its content suppliers and is protected by Nepal and international copyright laws. Product names, logos, and brands are property of their respective owners and are used for identification purposes only.',
  },
  {
    title: '7. User Conduct',
    content: 'You agree not to: use the service for any unlawful purpose; attempt to gain unauthorized access to any part of the service; interfere with or disrupt the service; resell products purchased from Premium Subscriptions Store without authorization; provide false or misleading information during registration or purchase.',
  },
  {
    title: '8. Limitation of Liability',
    content: 'Premium Subscriptions Store shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. Our total liability for any claim arising from these terms shall not exceed the amount paid by you for the specific product in question.',
  },
  {
    title: '9. Governing Law',
    content: 'These Terms and Conditions shall be governed by and construed in accordance with the laws of Nepal. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Kathmandu, Nepal.',
  },
  {
    title: '10. Changes to Terms',
    content: 'Premium Subscriptions Store reserves the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on the website. Your continued use of the service after any changes constitutes acceptance of the new terms.',
  },
  {
    title: '11. Contact',
    content: 'For any questions regarding these Terms and Conditions, please contact us at support@premiumsubscriptions.com or visit our Contact page.',
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Breadcrumb items={[{ label: 'Terms & Conditions' }]} />
        <div className="mt-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Terms & Conditions</h1>
            <p className="text-[12px] text-muted-foreground">Last updated: February 2026</p>
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
