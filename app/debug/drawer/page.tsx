"use client"

import { DrawerTest } from "@/components/drawer-test"
import { useBreakpoint } from "@/hooks/use-breakpoint"

export default function DrawerDebugPage() {
  const { breakpoint, width, isAboveLg } = useBreakpoint()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Drawer Functionality Debug</h1>
      <p className="mb-4">
        This page is used to test and debug the drawer functionality. Resize your browser window to test responsive
        behavior at different breakpoints.
      </p>

      <div className="grid gap-6">
        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Current Breakpoint Information</h2>
          <div className="p-3 bg-gray-100 rounded-md">
            <p>
              <strong>Current width:</strong> {width}px
            </p>
            <p>
              <strong>Current breakpoint:</strong> {breakpoint}
            </p>
            <p>
              <strong>Navigation style:</strong> {isAboveLg ? "Horizontal Menu" : "Drawer"}
            </p>
          </div>

          <div className="mt-4">
            <h3 className="font-medium">Tailwind Breakpoints:</h3>
            <ul className="list-disc ml-6 mt-2">
              <li>sm: 640px</li>
              <li>md: 768px</li>
              <li>lg: 1024px</li>
              <li>xl: 1280px</li>
              <li>2xl: 1536px</li>
            </ul>
          </div>
        </div>

        <DrawerTest />
      </div>
    </div>
  )
}
