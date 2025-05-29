"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center transition-opacity duration-200",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-white/10 transition-colors duration-200">
      <SliderPrimitive.Range className="absolute h-full bg-[#FBF6E8] transition-all duration-200 ease-out" />
    </SliderPrimitive.Track>
    {props.value && Array.isArray(props.value) && props.value.length > 1 ? (
      // For range slider with two thumbs
      <>
        <SliderPrimitive.Thumb className="block w-4 h-4 rounded-full bg-[#FBF6E8] border-2 border-[#FBF6E8] ring-offset-background transition-all duration-200 focus-visible:outline-none focus:ring-2 focus:ring-[#FBF6E8] focus:ring-offset-2 hover:shadow-md active:shadow-md" />
        <SliderPrimitive.Thumb className="block w-4 h-4 rounded-full bg-[#FBF6E8] border-2 border-[#FBF6E8] ring-offset-background transition-all duration-200 focus-visible:outline-none focus:ring-2 focus:ring-[#FBF6E8] focus:ring-offset-2 hover:shadow-md active:shadow-md" />
      </>
    ) : (
      // For single thumb slider
      <SliderPrimitive.Thumb className="block w-4 h-4 rounded-full bg-[#FBF6E8] border-2 border-[#FBF6E8] ring-offset-background transition-all duration-200 focus-visible:outline-none focus:ring-2 focus:ring-[#FBF6E8] focus:ring-offset-2 hover:shadow-md active:shadow-md" />
    )}
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
