"use client"

import { createContext, useContext, type ReactNode } from "react"
import { usePrivy } from "@privy-io/react-auth"

type User = {
  id: string
  name: string
  email: string
  avatar: string
  walletAddress?: string
  username?: string
  firstName?: string
  lastName?: string
  bio?: string
  discord?: string
  twitter?: string
  github?: string
  profileImage?: string | null
  profileImageUrl?: string | null
  university?: string
  socials?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, user: privyUser, logout: privyLogout } = usePrivy()
  const emailAddress =
  typeof privyUser?.email === "object" && typeof privyUser.email.address === "string"
    ? privyUser.email.address
    : ""
  // Debug: Check Privy authentication state
  // console.log("AuthContext - privyUser:", privyUser)
  // console.log("AuthContext - ready:", ready)
  // console.log("AuthContext - authenticated:", authenticated)
  
  const transformedUser: User | null =
    privyUser && typeof privyUser.id === "string"
      ? {
          id: privyUser.id,
          name: privyUser.customMetadata?.firstName
            ? `${privyUser.customMetadata.firstName} ${privyUser.customMetadata.lastName || ""}`
            : emailAddress.split("@")[0] || "Anonymous",
          email: emailAddress,
          walletAddress: privyUser.wallet?.address,
          avatar:
            (privyUser.customMetadata?.profileImageUrl as string) ||
            (privyUser.customMetadata?.profileImage as string) ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${emailAddress || privyUser.id}`,
          ...privyUser.customMetadata,
        }
      : null

  // console.log("AuthContext - transformedUser:", transformedUser)

  return (
    <AuthContext.Provider 
      value={{
        user: transformedUser,
        isLoading: !ready,
        logout: privyLogout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
