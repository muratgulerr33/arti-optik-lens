"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group peer flex items-center justify-center size-11 min-w-11 min-h-11 shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    >
      {/* Visual box - always rendered, visible in both checked and unchecked states */}
      {/* Root is 44px hit-area (no border/bg). Inner 16px box is the visual border/bg. */}
      <span
        aria-hidden
        className="pointer-events-none flex size-4 items-center justify-center rounded-[4px] border border-foreground/15 dark:border-foreground/20 bg-muted/25 dark:bg-muted/15 shadow-xs transition-[colors,box-shadow] group-data-[state=checked]:bg-primary group-data-[state=checked]:border-primary group-data-[state=checked]:text-primary-foreground group-disabled:bg-muted/10 dark:group-disabled:bg-muted/10 group-disabled:border-foreground/10 dark:group-disabled:border-foreground/10 group-disabled:opacity-60 group-disabled:cursor-not-allowed"
      >
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          className="grid place-content-center text-primary-foreground transition-none"
        >
          <CheckIcon className="size-3.5" />
        </CheckboxPrimitive.Indicator>
      </span>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
