"use client"

import { usePrivy } from "@privy-io/react-auth"
import { Dialog, DialogContent } from "@/components/ui/dialog"

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
  initialMode: "login" | "signup"
}

export function AuthModal({ isOpen, onClose, initialMode }: AuthModalProps) {
  const { login } = usePrivy()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4 px-4 py-8">
            <h2 className="text-2xl font-bold text-center">
              {initialMode === "login" ? "Welcome back!" : "Get started"}
            </h2>
            <p className="text-center text-gray-500">
              {initialMode === "login"
                ? "Log in to access your account"
                : "Sign up to start earning bounties"}
            </p>
            <button
              onClick={() => {
                login()
                onClose()
              }}
              className="w-full bg-[#5865F2] text-white rounded-lg px-4 py-2 font-medium hover:bg-[#4752C4] transition-colors"
            >
              Continue with Privy
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
