"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { ChevronDown } from "lucide-react"
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
        className="flex items-center gap-2 rounded-full bg-transparent border border-[#FBF6E8] text-[#FBF6E8] px-3 py-2 transition-colors duration-200 ease-in-out hover:bg-[#FBF6E8] hover:text-[#091C2E] group"
      >
        <div className="relative w-6 h-6 rounded-full overflow-hidden">
          <Image
            src={user.avatar || "/placeholder.svg"}
            alt={user.name}
            width={24}
            height={24}
            className="rounded-full"
          />
        </div>
        <span className="text-sm font-medium">{user.name}</span>
        <ChevronDown className="h-4 w-4 transition-colors duration-200 ease-in-out group-hover:text-[#091C2E]" />
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
