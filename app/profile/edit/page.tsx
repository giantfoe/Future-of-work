"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Upload, X, Github } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { useUser } from "@privy-io/react-auth";


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
      setProfileImage(user.profileImage || null)
    }
  }, [user])
  const [bioCharactersLeft, setBioCharactersLeft] = useState(161)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
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

    const metadataPayload: Record<string, any> = {
      username: formData.username,
      firstName: formData.firstName,
      lastName: formData.lastName,
      bio: formData.bio,
      discord: formData.discord,
      twitter: formData.twitter,
      github: formData.github,
      ...(profileImage ? { profileImage } : {}) // <-- only include if profileImage is truthy
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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">Edit Profile</h1>

      <form onSubmit={handleSubmit}>
        {/* PERSONAL INFO SECTION */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-600 mb-6">PERSONAL INFO</h2>

          {/* Profile Picture */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Profile Picture</label>
            <div
              className={`border border-dashed ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"} rounded-md p-6 flex flex-col items-center justify-center cursor-pointer`}
              onClick={triggerFileInput}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

              {profileImage ? (
                <div className="relative w-24 h-24 mb-2">
                  <Image
                    src={profileImage || "/placeholder.svg"}
                    alt="Profile preview"
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
              ) : (
                <div className="bg-gray-100 p-4 rounded-md mb-2">
                  <Upload className="h-6 w-6 text-gray-500" />
                </div>
              )}

              <p className="text-gray-700 mb-1">Choose or drag and drop media</p>
              <p className="text-gray-500 text-sm">Maximum size 5 MB</p>
            </div>
          </div>

          {/* Username */}
          <div className="mb-6">
            <label htmlFor="username" className="block text-gray-700 mb-2">
              Username<span className="text-red-500">*</span>
            </label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* First Name */}
          <div className="mb-6">
            <label htmlFor="firstName" className="block text-gray-700 mb-2">
              First Name<span className="text-red-500">*</span>
            </label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Last Name */}
          <div className="mb-6">
            <label htmlFor="lastName" className="block text-gray-700 mb-2">
              Last Name<span className="text-red-500">*</span>
            </label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label htmlFor="bio" className="block text-gray-700 mb-2">
              Your One-Line Bio
            </label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md"
              rows={3}
              maxLength={200}
            />
            <div className="text-right text-sm text-gray-500 mt-1">{bioCharactersLeft} characters left</div>
          </div>
        </div>

        {/* SOCIALS SECTION */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-600 mb-6">SOCIALS</h2>

          {/* Discord */}
          <div className="mb-6 flex items-center">
            <div className="w-8 h-8 flex items-center justify-center mr-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4C14.89 4.21 14.76 4.48 14.67 4.7C13.06 4.47 11.46 4.47 9.85 4.7C9.76 4.48 9.63 4.21 9.52 4C8.02 4.26 6.58 4.71 5.25 5.33C2.05 10.11 1.28 14.78 1.67 19.38C3.47 20.76 5.2 21.63 6.91 22.21C7.29 21.69 7.63 21.14 7.91 20.56C7.25 20.33 6.62 20.04 6.02 19.69C6.14 19.6 6.25 19.51 6.36 19.41C9.96 21.07 13.98 21.07 17.54 19.41C17.65 19.51 17.76 19.6 17.88 19.69C17.28 20.04 16.65 20.33 15.99 20.56C16.27 21.14 16.61 21.69 16.99 22.21C18.7 21.63 20.43 20.76 22.23 19.38C22.68 14.06 21.47 9.44 19.27 5.33ZM8.12 16.59C7.11 16.59 6.27 15.65 6.27 14.5C6.27 13.35 7.09 12.41 8.12 12.41C9.15 12.41 9.99 13.35 9.97 14.5C9.97 15.65 9.15 16.59 8.12 16.59ZM15.88 16.59C14.87 16.59 14.03 15.65 14.03 14.5C14.03 13.35 14.85 12.41 15.88 12.41C16.91 12.41 17.75 13.35 17.73 14.5C17.73 15.65 16.91 16.59 15.88 16.59Z"
                  fill="#5865F2"
                />
              </svg>
            </div>
            <Input
              id="discord"
              name="discord"
              value={formData.discord}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md"
              placeholder="Discord username"
            />
          </div>

          {/* Twitter/X */}
          <div className="mb-6 flex items-center">
            <div className="w-8 h-8 flex items-center justify-center mr-2">
              <X className="h-5 w-5" />
            </div>
            <div className="flex items-center w-full">
              <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-r-0 rounded-l-md text-gray-600">
                x.com/
              </div>
              <Input
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-none rounded-r-md"
                placeholder="Twitter username"
              />
            </div>
          </div>

          {/* GitHub */}
          <div className="mb-6 flex items-center">
            <div className="w-8 h-8 flex items-center justify-center mr-2">
              <Github className="h-5 w-5" />
            </div>
            <div className="flex items-center w-full">
              <div className="bg-gray-100 px-3 py-2 border border-gray-300 border-r-0 rounded-l-md text-gray-600">
                github.com/
              </div>
              <Input
                id="github"
                name="github"
                value={formData.github}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-none rounded-r-md"
                placeholder="GitHub username"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            type="submit"
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
