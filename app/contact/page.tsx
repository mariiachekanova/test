'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Breadcrumb } from '@/components/breadcrumb'
import { Mail, MessageCircle, Clock, MapPin, Send, Loader2 } from 'lucide-react'

const contactInfo = [
  { icon: MessageCircle, label: 'WhatsApp', value: '+977 9746334202', href: 'https://wa.me/9779746334202' },
  { icon: Mail, label: 'Email', value: 'support@premiumsubscriptions.store', href: 'mailto:support@premiumsubscriptions.store' },
  { icon: MessageCircle, label: 'Live Chat', value: 'Available on site', href: '#' },
  { icon: Clock, label: 'Support Hours', value: 'Sun-Fri, 10AM - 6PM NPT', href: undefined },
  { icon: MapPin, label: 'Location', value: 'Kathmandu, Nepal', href: undefined },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    // Simulate sending
    await new Promise(r => setTimeout(r, 1500))
    setSending(false)
    setSent(true)
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Breadcrumb items={[{ label: 'Contact Us' }]} />

        <div className="mt-6 space-y-8">
          <section className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-balance">
              Contact <span className="text-primary">Us</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Have a question, issue, or feedback? Our team in Kathmandu is here to help.
            </p>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-3">
              {contactInfo.map((c) => (
                <div key={c.label} className="bg-card rounded-xl border border-border/60 p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <c.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">{c.label}</p>
                    {c.href ? (
                      <a href={c.href} className="text-[13px] font-semibold text-foreground hover:text-primary transition-colors">{c.value}</a>
                    ) : (
                      <p className="text-[13px] font-semibold text-foreground">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3 bg-card rounded-xl border border-border/60 p-5 sm:p-6">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                    <Send className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h3 className="text-[15px] font-bold text-foreground mb-1">Message Sent</h3>
                  <p className="text-[12px] text-muted-foreground mb-4">We&apos;ll get back to you within 24 hours.</p>
                  <button onClick={() => setSent(false)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-[12px] font-semibold hover:bg-primary/90 transition-colors cursor-pointer">
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-[15px] font-bold text-foreground">Send us a message</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Full Name</label>
                      <input
                        type="text" required value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3 py-2 bg-secondary/50 border border-border/60 rounded-lg text-[12px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">Email</label>
                      <input
                        type="email" required value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3 py-2 bg-secondary/50 border border-border/60 rounded-lg text-[12px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Subject</label>
                    <input
                      type="text" required value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-secondary/50 border border-border/60 rounded-lg text-[12px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50"
                      placeholder="Order issue, feedback, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">Message</label>
                    <textarea
                      required rows={4} value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      className="w-full px-3 py-2 bg-secondary/50 border border-border/60 rounded-lg text-[12px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                      placeholder="Describe your question or issue..."
                    />
                  </div>
                  <button
                    type="submit" disabled={sending}
                    className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
