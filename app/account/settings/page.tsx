"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { User, Mail, Phone, Lock, Camera, Check, AlertCircle, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.35, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

type Toast = { type: "success" | "error"; message: string } | null

function SettingsToast({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [toast, onDone])
  if (!toast) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-medium shadow-lg border ${
        toast.type === "success"
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          : "bg-red-500/10 border-red-500/20 text-red-400"
      }`}
    >
      {toast.type === "success" ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
      {toast.message}
    </motion.div>
  )
}

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const supabase = createClient()

  // Profile fields
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  // Loading states
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [toast, setToast] = useState<Toast>(null)

  // Load profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "")
      setEmail(profile.email || user?.email || "")
      setAvatarUrl(profile.avatar_url || null)
    }
    if (user) {
      setPhone(user.user_metadata?.phone || "")
    }
  }, [profile, user])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingAvatar(true)
    try {
      const ext = file.name.split(".").pop()
      const filePath = `avatars/${user.id}-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from("payment-screenshots").upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from("payment-screenshots").getPublicUrl(filePath)
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id)
      setAvatarUrl(publicUrl)
      await refreshProfile()
      setToast({ type: "success", message: "Avatar updated successfully" })
    } catch {
      setToast({ type: "error", message: "Failed to upload avatar" })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    setSavingProfile(true)
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: fullName.trim(),
        email: email.trim(),
      }).eq("id", user.id)
      if (error) throw error

      // Update phone in auth user metadata
      if (phone.trim()) {
        await supabase.auth.updateUser({ data: { phone: phone.trim() } })
      }

      await refreshProfile()
      setToast({ type: "success", message: "Profile updated successfully" })
    } catch {
      setToast({ type: "error", message: "Failed to update profile" })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setToast({ type: "error", message: "Please fill in all password fields" })
      return
    }
    if (newPassword.length < 6) {
      setToast({ type: "error", message: "Password must be at least 6 characters" })
      return
    }
    if (newPassword !== confirmPassword) {
      setToast({ type: "error", message: "Passwords do not match" })
      return
    }
    setSavingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setToast({ type: "success", message: "Password changed successfully" })
    } catch (err: any) {
      setToast({ type: "error", message: err?.message || "Failed to change password" })
    } finally {
      setSavingPassword(false)
    }
  }

  const clearToast = useCallback(() => setToast(null), [])

  const initial = fullName?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase() || "U"

  return (
    <>
      <SettingsToast toast={toast} onDone={clearToast} />

      <motion.div initial="hidden" animate="visible" className="flex flex-col gap-4">
        {/* Page Header */}
        <motion.div variants={fadeUp} custom={0}>
          <h1 className="text-lg font-bold text-foreground">Settings</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Manage your profile and security preferences.</p>
        </motion.div>

        {/* Avatar Section */}
        <motion.div variants={fadeUp} custom={1} className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-[14px] font-semibold text-foreground mb-4">Profile Photo</h2>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full bg-secondary border-2 border-border flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-primary">{initial}</span>
                )}
              </div>
              <label className="absolute inset-0 rounded-full flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {uploadingAvatar ? (
                  <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-foreground" />
                )}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
              </label>
            </div>
            <div>
              <p className="text-[13px] font-medium text-foreground">{fullName || "Your Name"}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Click the photo to upload a new avatar.</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">JPG, PNG or WebP. Max 2MB.</p>
            </div>
          </div>
        </motion.div>

        {/* Profile Information */}
        <motion.div variants={fadeUp} custom={2} className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-[14px] font-semibold text-foreground mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-secondary border border-border rounded-xl text-[13px] text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-secondary border border-border rounded-xl text-[13px] text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] text-muted-foreground mb-1 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-secondary border border-border rounded-xl text-[13px] text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="+977 98XXXXXXXX"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-[12px] font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {savingProfile ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div variants={fadeUp} custom={3} className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-[14px] font-semibold text-foreground mb-1">Change Password</h2>
          <p className="text-[11px] text-muted-foreground mb-4">Update your password to keep your account secure.</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-secondary border border-border rounded-xl text-[13px] text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Enter current password"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground cursor-pointer">
                  {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-secondary border border-border rounded-xl text-[13px] text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="Min. 6 characters"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground cursor-pointer">
                    {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground mb-1 block">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                  <input
                    type={showNew ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-secondary border border-border rounded-xl text-[13px] text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
            </div>
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[11px] text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Passwords do not match
              </p>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleChangePassword}
              disabled={savingPassword || !newPassword || !confirmPassword}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-[12px] font-semibold hover:bg-secondary/80 disabled:opacity-40 transition-colors cursor-pointer"
            >
              {savingPassword ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={fadeUp} custom={4} className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
          <h2 className="text-[14px] font-semibold text-red-400 mb-1">Danger Zone</h2>
          <p className="text-[11px] text-muted-foreground mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <button className="px-4 py-2 rounded-xl border border-red-500/30 text-[12px] font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
            Delete Account
          </button>
        </motion.div>
      </motion.div>
    </>
  )
}
