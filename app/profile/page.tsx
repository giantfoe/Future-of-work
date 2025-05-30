"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/auth-modal"
import Image from "next/image"
import FuturisticBackground from "@/components/FuturisticBackground"
export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login")

  // Don't redirect immediately, let user see the login prompt
  // useEffect(() => {
  //   if (!isLoading && !user) {
  //     console.log('Profile page - redirecting to home because user is not authenticated')
  //     router.push("/")
  //   }
  // }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 relative z-20">
        <div className="text-center relative z-20">
          <div className="text-[#FBF6E8] relative z-20">Loading profile...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <div className="container mx-auto p-6 relative z-20">
          <div className="text-center relative z-20">
            <h1 className="text-3xl font-bold mb-6 text-[#FBF6E8] relative z-20">Profile</h1>
            <div className="max-w-md mx-auto relative z-20">
              <p className="text-[#C4C9D2] mb-6 relative z-20">You need to be logged in to view your profile.</p>
              <div className="flex gap-4 justify-center relative z-20">
                <Button
                  variant="outline"
                  onClick={() => {
                    setAuthModalMode("login")
                    setAuthModalOpen(true)
                  }}
                >
                  Login
                </Button>
                <Button
                  className="bg-[#5865F2] hover:bg-[#4752C4] relative z-20"
                  onClick={() => {
                    setAuthModalMode("signup")
                    setAuthModalOpen(true)
                  }}
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        </div>
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
          initialMode={authModalMode} 
        />
      </>
    )
  }

  // Debug: Check authentication state
  // console.log('Profile page - user:', user)
  // console.log('Profile page - isLoading:', isLoading)

  return (
    <section className="relative">
<FuturisticBackground />
    <div className="container mx-auto p-6 relative z-20" >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#FBF6E8] relative z-20">Profile</h1>
        <Button 
          onClick={() => router.push('/profile/edit')}
          className="glass-card border-[#1F3B54] text-[#FBF6E8] hover:bg-[#1F3B54]/20 relative z-20"
          variant="outline"
        >
          Edit Profile
        </Button>
      </div>

      {/* Profile Summary Card */}
      <div className="border border-[#1F3B54] rounded-xl px-6 py-6 flex flex-col md:flex-row gap-8 mb-6 items-start relative z-20">
        {/* Left Section: Profile Picture and Basic Info */}
        <div className="flex items-start gap-4 relative z-20">
          <div className="relative w-14 h-14 rounded-full border border-[#1F3B54] overflow-hidden relative z-20">
            <Image src={user.avatar || "/placeholder.svg"} alt={user.name} fill className="object-cover relative z-20" />
          </div>
          <div className="flex flex-col justify-center relative z-20">
            <h2 className="text-xl font-semibold text-[#FBF6E8] relative z-20">{user.name}</h2>
            <p className="text-sm text-[#C4C9D2] relative z-20">@{user.username || '-'}</p>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-px bg-[#1F3B54] h-auto hidden md:block relative z-20"></div>

        {/* Right Section: Details and Bio */}
        <div className="flex-1 flex flex-col relative z-20">
          {/* Details Grid - Only show fields that have data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full relative z-20">
            {user.email && (
              <div>
                <p className="text-xs text-muted-foreground relative z-20">Email:</p>
                <p className="text-sm text-[#FBF6E8]">{user.email}</p>
              </div>
            )}
            {user.university && (
              <div>
                <p className="text-xs text-muted-foreground relative z-20">University:</p>
                <p className="text-sm text-[#FBF6E8]">{user.university}</p>
              </div>
            )}
            {(user.discord || user.twitter || user.github) && (
              <div>
                <p className="text-xs text-muted-foreground relative z-20">Socials:</p>
                <div className="flex flex-col gap-1">
                  {user.discord && (
                    <p className="text-sm text-[#FBF6E8] relative z-20">Discord: {user.discord}</p>
                  )}
                  {user.twitter && (
                    <p className="text-sm text-[#FBF6E8] relative z-20">Twitter: @{user.twitter}</p>
                  )}
                  {user.github && (
                    <p className="text-sm text-[#FBF6E8] relative z-20">GitHub: {user.github}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bio - Only show if exists */}
          {user.bio && (
            <div className="mt-4 relative z-20">
              <p className="text-xs text-muted-foreground mb-1">Bio:</p>
              <p className="text-sm text-[#FBF6E8] leading-relaxed">
                {user.bio}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Card */}
      <div className="mt-8 relative z-20">
        <Card className="glass-card border-[#1F3B54]">
          <CardHeader className="pb-4">
            <CardTitle className="text-[#FBF6E8] text-xl relative z-20">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="min-h-[200px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1F3B54]/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#C4C9D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-[#C4C9D2] text-lg font-medium mb-2 relative z-20">No activity yet</p>
                <p className="text-[#C4C9D2]/70 text-sm relative z-20">Your bounty submissions and achievements will appear here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
    </div>
    </section>
  )
}
