"use client"

import { PrivyProvider as PrivyProviderBase } from "@privy-io/react-auth"
import type { ReactNode } from "react"

export function PrivyProvider({ children }: { children: ReactNode }) {
  return (
    <PrivyProviderBase
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ["email", "google"],
        appearance: {
          theme: "light",
          accentColor: "#5865F2",
          logo: "/placeholder-logo.svg",
          modalPosition: "center"
        },
        embeddedWallets: {
          solana: {
              createOnLogin: 'users-without-wallets',
          },
      },
      }}
    >
      {children}
    </PrivyProviderBase>
  )
}