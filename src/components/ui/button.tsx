import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 shadow-md hover:shadow-xl active:scale-[0.97] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-green-500 text-white hover:bg-green-600",

        destructive:
          "bg-red-500 text-white hover:bg-red-600",

        outline:
          "border-2 border-green-500 text-green-700 bg-white hover:bg-green-50",

        secondary:
          "bg-yellow-500 text-white hover:bg-yellow-600",

        ghost:
          "bg-transparent hover:bg-green-100 text-green-700 shadow-none",

        link:
          "text-green-600 underline-offset-4 hover:underline shadow-none",
      },

      size: {
        default: "h-11 px-6 py-2 text-base",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-lg rounded-full",
        xs: "h-7 px-3 text-xs rounded-xl",

        icon: "h-11 w-11 rounded-full",
        "icon-sm": "h-9 w-9 rounded-full",
        "icon-lg": "h-12 w-12 rounded-full",
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
  variant,
  size,
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
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
