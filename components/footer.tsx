import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[rgba(10,10,10,0.85)] backdrop-blur-[24px] border-t border-[rgba(96,165,250,0.08)] relative z-20">
      <div className="py-6 text-center text-sm text-muted-foreground">
        <div className="max-w-[1440px] px-4 md:px-6 mx-auto">
          © 2025 Bounty Platform. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
