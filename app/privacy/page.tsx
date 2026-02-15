import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Breadcrumb } from '@/components/breadcrumb'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read how Premium Subscriptions Store collects, uses, and protects your personal information when you use our digital products platform in Nepal.',
  alternates: { canonical: '/privacy' },
}

const sections = [
  {
    title: '1. Information We Collect',
    content: 'When you create an account or make a purchase on Premium Subscriptions Store, we collect: your name, email address, and phone number during registration; payment information processed securely through eSewa, Khalti, ConnectIPS, or other payment gateways (we do not store your payment credentials); order history and product delivery details; device information, IP address, and browser type for security and analytics; any information you voluntarily provide through our contact forms or support channels.',
  },
  {
    title: '2. How We Use Your Information',
    content: 'We use your personal information to: process and deliver your digital product purchases; send order confirmations and delivery notifications via email; provide customer support and respond to enquiries; improve our website, services, and user experience; prevent fraud, unauthorized access, and other illegal activities; comply with legal obligations under Nepal law; send promotional offers and updates (only with your consent, and you can opt out at any time).',
  },
  {
    title: '3. Information Sharing',
    content: 'Premium Subscriptions Store does not sell, trade, or rent your personal information to third parties. We may share limited information with: payment processors (eSewa, Khalti, ConnectIPS) to complete transactions; service providers who assist us in operating the website and conducting business; law enforcement or government authorities when required by Nepal law.',
  },
  {
    title: '4. Data Security',
    content: 'We implement industry-standard security measures to protect your personal information, including: encrypted data transmission using SSL/TLS protocols; secure password hashing; regular security audits and monitoring; restricted access to personal information on a need-to-know basis. While we strive to protect your data, no method of transmission over the internet is 100% secure.',
  },
  {
    title: '5. Cookies',
    content: 'Premium Subscriptions Store uses cookies and similar technologies to: keep you logged into your account; remember your preferences; analyze site traffic and usage patterns; improve our services. You can control cookie preferences through your browser settings. Disabling cookies may affect some functionality of the website.',
  },
  {
    title: '6. Your Rights',
    content: 'You have the right to: access the personal information we hold about you; request correction of inaccurate information; request deletion of your account and personal data; opt out of promotional communications; withdraw consent for data processing at any time. To exercise any of these rights, please contact us at support@premiumsubscriptions.store.',
  },
  {
    title: '7. Data Retention',
    content: 'We retain your personal information for as long as your account is active or as needed to provide services. Order records are kept for a minimum of 5 years for accounting and legal purposes. You may request account deletion, after which we will delete your data within 30 days, except where retention is required by law.',
  },
  {
    title: '8. Children\'s Privacy',
    content: 'Premium Subscriptions Store does not knowingly collect personal information from individuals under the age of 16. If we learn that we have collected information from a child under 16, we will delete that information promptly.',
  },
  {
    title: '9. Changes to This Policy',
    content: 'We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "last modified" date. We encourage you to review this policy periodically.',
  },
  {
    title: '10. Contact',
    content: 'If you have any questions about this Privacy Policy or our data practices, please contact us at support@premiumsubscriptions.store or visit our Contact page.',
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Breadcrumb items={[{ label: 'Privacy Policy' }]} />
        <div className="mt-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Privacy Policy</h1>
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
