'use client';
import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { AuthProvider } from "@/contexts/auth-context"
import { PrivyProvider } from "@/components/privy-provider"

const inter = Inter({ subsets: ["latin"] })

// export const metadata = {
//   title: "Bounty Platform",
//   description: "A platform for bounties and rewards",
//     generator: 'v0.dev'
// }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PrivyProvider>
          <AuthProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </AuthProvider>
        </PrivyProvider>
      </body>
    </html>
  )
}
