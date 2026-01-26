import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[colors,box-shadow,transform] duration-motion ease-motion-out disabled:pointer-events-none disabled:opacity-[var(--disabled-opacity)] disabled:shadow-none disabled:transform-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] active:transition-transform active:duration-motion-fast aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md active:shadow-sm",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 hover:shadow-md active:shadow-sm focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground hover:shadow-md active:shadow-sm dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md active:shadow-sm",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:shadow-sm active:shadow-none dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline active:opacity-80",
      },
      size: {
        default: "min-h-11 h-11 px-4 py-2 has-[>svg]:px-3",
        xs: "min-h-11 h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3 before:absolute before:inset-[-8px] before:content-[''] before:pointer-events-none",
        sm: "min-h-11 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 before:absolute before:inset-[-6px] before:content-[''] before:pointer-events-none",
        lg: "min-h-11 h-12 rounded-md px-6 has-[>svg]:px-4",
        icon: "min-w-11 min-h-11 size-11",
        "icon-xs": "min-w-11 min-h-11 size-6 rounded-md [&_svg:not([class*='size-'])]:size-3 before:absolute before:inset-[-8px] before:content-[''] before:pointer-events-none",
        "icon-sm": "min-w-11 min-h-11 size-8 before:absolute before:inset-[-6px] before:content-[''] before:pointer-events-none",
        "icon-lg": "min-w-11 min-h-11 size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
