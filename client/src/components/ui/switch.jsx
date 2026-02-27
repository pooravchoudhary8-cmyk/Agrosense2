import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-800 data-[state=checked]:shadow-[0_0_15px_-3px_rgba(16,185,129,0.5)]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-xl ring-0 transition-transform duration-300 ease-in-out data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5 border border-slate-200/50"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
