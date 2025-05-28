"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function DrawerTest() {
  const [open, setOpen] = useState(false)

  return (
    <div className="p-4 border rounded-lg mt-4">
      <h2 className="text-lg font-semibold mb-2">Drawer Test Component</h2>
      <p className="mb-4">Click the button below to test the drawer functionality</p>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline">Open Test Drawer</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Test Drawer</SheetTitle>
            <SheetDescription>
              This is a test drawer to verify the Sheet component is working correctly.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <p>If you can see this content, the drawer is functioning properly.</p>
            <Button className="mt-4" onClick={() => setOpen(false)}>
              Close Drawer
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
