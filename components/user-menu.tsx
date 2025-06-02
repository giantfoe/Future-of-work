"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

export function UserMenu() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  if (!user) return null

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center hover grey 800  text-white p-1 rounded-full transition-colors duration-200 w-10 h-10 ring-2 ring-gray-900 ring-offset-2 ring-offset-gray-800"
      >
        <Image
          src={user?.avatar || user?.picture || '/placeholder-user.jpg'}
          alt={user?.name || 'User'}
          width={32}
          height={32}
          className="rounded-full object-cover w-full h-full"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-[#0a0a0a] border border-[#1F3B54] rounded-md py-2 shadow-md text-[#FBF6E8] transition-all duration-200">
          <button
            onClick={() => {
              setIsOpen(false)
              router.push("/profile")
            }}
            className="block w-full px-4 py-2 text-sm text-center transition-colors duration-200 rounded-sm hover:bg-[#FBF6E8]/10 hover:text-foreground"
          >
            Profile
          </button>
          <button
            onClick={() => {
              setIsOpen(false)
              router.push("/profile/edit")
            }}
            className="block w-full px-4 py-2 text-sm text-center transition-colors duration-200 rounded-sm hover:bg-[#FBF6E8]/10 hover:text-foreground"
          >
            Edit Profile
          </button>
          <button
            onClick={() => {
              logout()
              setIsOpen(false)
            }}
            className="block w-full px-4 py-2 text-sm font-semibold text-red-500 text-center transition-colors duration-200 rounded-sm hover:bg-red-600/10 hover:text-red-400"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
