"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>
  }

  if (!user) {
    return null
  }

  console.log(user)

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-[#FBF6E8]">Profile</h1>

      {/* Profile Summary Card */}
      <div className="border border-[#1F3B54] rounded-xl px-6 py-6 flex flex-col md:flex-row gap-8 mb-6 items-start">
        {/* Left Section: Profile Picture and Basic Info */}
        <div className="flex items-start gap-4">
          <div className="relative w-14 h-14 rounded-full border border-[#1F3B54] overflow-hidden">
            <Image src={user.avatar || "/placeholder.svg"} alt={user.name} fill className="object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-xl font-semibold text-[#FBF6E8]">{user.name}</h2>
            <p className="text-sm text-[#C4C9D2]">@{user.username || '-'}</p>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-px bg-[#1F3B54] h-auto hidden md:block"></div>

        {/* Right Section: Details and Bio */}
        <div className="flex-1 flex flex-col">
          {/* Details Grid (Email, University, Socials) */}
          <div className="grid grid-cols-3 gap-6 w-full">
            <div>
              <p className="text-xs text-muted-foreground">Email:</p>
              <p className="text-sm text-[#FBF6E8]">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">University:</p>
              <p className="text-sm text-[#FBF6E8]">{user.university || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Socials:</p>
              <p className="text-sm text-[#FBF6E8]">{user.socials || '-'}</p>
            </div>
          </div>

          {/* Bio */}
          <p className="mt-4 text-sm text-[#FBF6E8] leading-relaxed">
            {user.bio || '-'}
          </p>
        </div>
      </div>

      {/* Activity Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Removed User Information Card */}

        <Card className="">
          <CardHeader>
            <CardTitle className="text-[#FBF6E8]">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#C4C9D2]">No activity yet.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
