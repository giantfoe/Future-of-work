'use client';
import type React from "react"
import "./globals.css"
// Removed Inter import as it's no longer the primary font
// import { Inter } from "next/font/google"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { AuthProvider } from "@/contexts/auth-context"
import { PrivyProvider } from "@/components/privy-provider"
import { GlobalSearch } from "@/components/global-search"

// const inter = Inter({ subsets: ["latin"] })

// export const metadata = {
//   title: "Bounty Platform",
//   description: "A platform for bounties and rewards",
//     generator: 'v0.dev'
// }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans text-foreground">
        <div className="gradient-background"></div>
        <PrivyProvider>
          <AuthProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <GlobalSearch />
          </AuthProvider>
        </PrivyProvider>
      </body>
    </html>
  )
}
