"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, User, Loader2, ArrowRight, UserPlus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function SignUpPage() {
  const router = useRouter()
  const { signUp, signInWithGoogle, loading } = useAuth()
  const { toast } = useToast()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !password) {
      toast({ variant: "error", title: "Missing fields", description: "Please fill in all required fields." })
      return
    }
    if (password.length < 8) {
      toast({ variant: "error", title: "Weak password", description: "Password must be at least 8 characters." })
      return
    }
    if (!agreeTerms) {
      toast({ variant: "warning", title: "Terms required", description: "Please agree to the Terms of Service." })
      return
    }
    setIsLoading(true)
    const result = await signUp({ fullName, email, password })
    setIsLoading(false)
    if (!result.success) {
      toast({ variant: "error", title: "Sign up failed", description: result.error || "Unable to create account." })
      return
    }
    if (result.autoSignedIn) {
      toast({ variant: "success", title: "Welcome to Premium Subscriptions Store!", description: "Your account has been created and you're signed in." })
      // Trigger refresh in background without blocking navigation
      setIsRefreshing(true)
      router.push("/account")
      // Refresh page after navigation starts
      setTimeout(() => {
        router.refresh()
        setIsRefreshing(false)
      }, 100)
    } else {
      toast({ variant: "success", title: "Account created!", description: "Please check your email to confirm your account, then sign in." })
      router.push("/account/signin")
    }
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    const result = await signInWithGoogle()
    if (!result.success) {
      setIsGoogleLoading(false)
      toast({ variant: "error", title: "OAuth failed", description: result.error || "Could not connect to Google." })
    }
  }

  if (loading) return null

  return (
    <div className="w-full max-w-[460px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl border border-border/60 glass-card overflow-hidden shadow-[0_8px_32px_hsl(0_0%_0%/0.4)]"
      >
        <div className="p-6 sm:p-8">
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 mb-3">
              <UserPlus className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-[22px] font-bold text-foreground">Create Account</h1>
            <p className="text-[13px] text-muted-foreground mt-1">Join Premium Subscriptions Store and start buying gift cards</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="fullName" className="block text-[13px] font-medium text-foreground mb-1.5">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="w-full h-11 pl-11 pr-4 bg-input border border-border rounded-xl text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-foreground mb-1.5">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full h-11 pl-11 pr-4 bg-input border border-border rounded-xl text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[13px] font-medium text-foreground mb-1.5">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className="w-full h-11 pl-11 pr-11 bg-input border border-border rounded-xl text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-border bg-input accent-primary cursor-pointer shrink-0" />
              <span className="text-[13px] text-muted-foreground leading-relaxed">
                I agree to the <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading || isRefreshing}
              className="w-full h-11 mt-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold text-[14px] tracking-wide uppercase rounded-xl shadow-[0_1px_2px_hsl(0_0%_0%/0.3),inset_0_1px_0_hsl(0_0%_100%/0.1)] hover:brightness-110 hover:shadow-[0_4px_16px_hsl(38_92%_50%/0.25)] active:scale-[0.97] transition-all duration-200 disabled:opacity-60 cursor-pointer group"
            >
              {isLoading || isRefreshing ? <Loader2 className="w-5 h-5 animate-spin" /> : (<>Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>)}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[12px] text-muted-foreground">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading}
            className="w-full h-10 flex items-center justify-center gap-2 border border-border/60 rounded-xl text-[13px] font-medium text-foreground hover:bg-secondary hover:border-muted-foreground/20 shadow-xs transition-all duration-200 active:scale-[0.97] cursor-pointer disabled:opacity-60"
          >
            {isGoogleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            )}
            Continue with Google
          </button>

          <p className="text-center text-[13px] text-muted-foreground mt-5">
            Already have an account?{" "}
            <Link href="/account/signin" className="font-medium text-primary hover:underline cursor-pointer">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
