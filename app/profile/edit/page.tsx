"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Upload, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useUser } from "@privy-io/react-auth"
import FuturisticBackground from "@/components/FuturisticBackground"


export default function EditProfilePage() {
  const { user, isLoading } = useAuth()
  const { refreshUser } = useUser();
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: user?.username || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: user?.bio || '',
    discord: user?.discord || '',
    twitter: user?.twitter || '',
    github: user?.github || '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        discord: user.discord || '',
        twitter: user.twitter || '',
        github: user.github || '',
      })
      setProfileImage(user.profileImageUrl || null)
    }
  }, [user])
  const [bioCharactersLeft, setBioCharactersLeft] = useState(161)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  console.log("User edit", user)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === "bio") {
      // Assuming max length is 200 characters
      setBioCharactersLeft(200 - value.length)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    let profileImageUrl = profileImage // Keep existing URL if no new image

    // If profileImage contains base64 data (new upload), upload to Cloudinary first
    if (profileImage && profileImage.startsWith('data:')) {
      setIsUploadingImage(true)
      try {
        const uploadResponse = await fetch('/api/upload-profile-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            base64Data: profileImage,
            userId: user.id,
          }),
        })

        const uploadResult = await uploadResponse.json()

        if (uploadResult.success) {
          profileImageUrl = uploadResult.imageUrl
        } else {
          console.error('Image upload failed:', uploadResult.message)
          alert('Failed to upload image. Please try again.')
          setIsUploadingImage(false)
          return
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        alert('Failed to upload image. Please try again.')
        setIsUploadingImage(false)
        return
      }
      setIsUploadingImage(false)
    }

    const metadataPayload: Record<string, any> = {
      username: formData.username,
      firstName: formData.firstName,
      lastName: formData.lastName,
      bio: formData.bio,
      discord: formData.discord,
      twitter: formData.twitter,
      github: formData.github,
      ...(profileImageUrl ? { profileImageUrl } : {}) // Store URL, not base64
    }
  
    try {
      const res = await fetch('/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          did: user.id, // This is your DID: did:privy:xxxx
          metadata: metadataPayload
        }),
      })
  
      const data = await res.json()
  
      if (!res.ok) {
        console.error('Failed:', data.error)
        alert('Failed to update profile. Please try again.')
        return
      }
      await refreshUser();
      router.push('/profile')
    } catch (error) {
      console.error('Error submitting:', error)
      alert('Something went wrong.')
    }
  }
  
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit")
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit")
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>
  }

  return (
    <section className="relative">
      <FuturisticBackground />
      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#FBF6E8] relative z-20">Edit Profile</h1>
          <Button 
            onClick={() => router.push('/profile')}
            className="glass-card border-[#1F3B54] text-[#FBF6E8] hover:bg-[#1F3B54]/20 relative z-20"
            variant="outline"
          >
            Back to Profile
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
        {/* Add a container for the two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* PERSONAL INFO SECTION */}
        <Card className="glass-card border-[#1F3B54] relative z-20">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-[#FBF6E8] relative z-20">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">

            {/* Profile Picture */}
            <div className="mb-6 mt-8">
              <label className="block text-[#FBF6E8] mb-2 relative z-20">Profile Picture</label>
              <div
                className={`border border-dashed ${isDragging ? "border-[#5865F2] bg-[#5865F2]/10 relative z-20" : "border-[#1F3B54] relative z-20"} rounded-md p-10 flex flex-col items-center justify-center cursor-pointer relative z-20 hover:border-[#5865F2]/50 transition-colors`}
                onClick={triggerFileInput}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                {profileImage ? (
                  <div className="relative w-24 h-24 mb-2 relative z-20">
                    <Image
                      src={profileImage || "/placeholder.svg"}
                      alt="Profile preview"
                      fill
                      className="rounded-md object-cover relative z-20"
                    />
                  </div>
                ) : (
                  <div className="bg-[#1F3B54]/30 p-4 rounded-md mb-2 relative z-20">
                    <Upload className="h-6 w-6 text-muted-foreground relative z-20" />
                  </div>
                )}

                <p className="text-[#FBF6E8] mb-1 relative z-20">Choose or drag and drop media</p>
                <p className="text-[#C4C9D2] text-sm relative z-20">Maximum size 5 MB</p>
              </div>
            </div>

            {/* Username */}
            <div className="relative z-20">
              <label htmlFor="username" className="block text-[#FBF6E8] mb-2 relative z-20">
                Username<span className="text-red-400 relative z-20">*</span>
              </label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full bg-[#1F3B54]/20 border-[#1F3B54] text-[#FBF6E8] placeholder:text-[#C4C9D2] focus:border-[#5865F2] relative z-20"
                required
              />
            </div>

            {/* First Name */}
            <div className="relative z-20">
              <label htmlFor="firstName" className="block text-[#FBF6E8] mb-2 relative z-20">
                First Name<span className="text-red-400 relative z-20">*</span>
              </label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full bg-[#1F3B54]/20 border-[#1F3B54] text-[#FBF6E8] placeholder:text-[#C4C9D2] focus:border-[#5865F2] relative z-20"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-[#FBF6E8] mb-2 relative z-20">
                Last Name<span className="text-red-400 relative z-20">*</span>
              </label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full bg-[#1F3B54]/20 border-[#1F3B54] text-[#FBF6E8] placeholder:text-[#C4C9D2] focus:border-[#5865F2] relative z-20"
                required
              />
            </div>

            {/* Bio */}
            <div className="relative z-20">
              <label htmlFor="bio" className="block text-[#FBF6E8] mb-2 relative z-20">
                Your Bio
              </label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full bg-[#1F3B54]/20 border-[#1F3B54] text-[#FBF6E8] placeholder:text-[#C4C9D2] focus:border-[#5865F2] relative z-20"
                rows={3}
                maxLength={200}
                placeholder="Tell us about yourself..."
              />
              <div className="text-right text-sm text-[#C4C9D2] mt-1 relative z-20">{bioCharactersLeft} characters left</div>
            </div>
          </CardContent>
        </Card>

        {/* SOCIALS SECTION */}
        <Card className="glass-card border-[#1F3B54] mb-8 self-start">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[#FBF6E8] relative z-20">Social Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Discord */}
            <div className="relative z-20 mt-8">
              <label htmlFor="discord" className="block text-[#FBF6E8] mb-2 relative z-20">
                Discord
              </label>
              <div className="flex items-center relative z-20">
                <span className="bg-[#1F3B54]/30 border border-[#1F3B54] border-r-0 px-3 pr-6 py-2 text-muted-foreground rounded-l-md relative z-20">
                  @
                </span>
                <Input
                  id="discord"
                  name="discord"
                  value={formData.discord}
                  onChange={handleInputChange}
                  className="flex-1 bg-[#1F3B54]/20 border-[#1F3B54] text-[#FBF6E8] placeholder:text-[#C4C9D2] focus:border-[#5865F2] rounded-l-none relative z-20"
                  placeholder="username"
                />
              </div>
            </div>

            {/* Twitter */}
            <div className="relative z-20">
              <label htmlFor="twitter" className="block text-[#FBF6E8] mb-2 relative z-20">
                Twitter/X
              </label>
              <div className="flex items-center relative z-20">
                <span className="bg-[#1F3B54]/30 border border-[#1F3B54] border-r-0 px-3 pr-6 py-2 text-muted-foreground rounded-l-md relative z-20">
                  @
                </span>
                <Input
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  className="flex-1 bg-[#1F3B54]/20 border-[#1F3B54] text-[#FBF6E8] placeholder:text-[#C4C9D2] focus:border-[#5865F2] rounded-l-none relative z-20"
                  placeholder="username"
                />
              </div>
            </div>

            {/* GitHub */}
            <div className="relative z-20">
              <label htmlFor="github" className="block text-[#FBF6E8] mb-2 relative z-20">
                GitHub
              </label>
              <div className="flex items-center relative z-20">
                <span className="bg-[#1F3B54]/30 border border-[#1F3B54] border-r-0 px-3 pr-6 py-2 text-muted-foreground rounded-l-md relative z-20">
                  @
                </span>
                <Input
                  id="github"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className="flex-1 bg-[#1F3B54]/20 border-[#1F3B54] text-[#FBF6E8] placeholder:text-[#C4C9D2] focus:border-[#5865F2] rounded-l-none relative z-20"
                  placeholder="username"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Close the two-column container */}
        </div>

        {/* Submit Button - Centered */}
        <div className="mt-8 flex justify-center relative z-20">
          <Button
            type="submit"
            disabled={isUploadingImage}
            className="w-full glass-card border-[#5865F2] bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-[#FBF6E8] py-3 rounded-md relative z-20 transition-all duration-200 disabled:opacity-50"
          >
            {isUploadingImage ? 'Uploading Image...' : 'Save Changes'}
          </Button>
        </div>
        </form>
      </div>
    </section>
  )
}

