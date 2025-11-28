import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "purple"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80", 
      destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
      outline: "text-foreground border-border",
      success: "border-transparent bg-green-500 text-white hover:bg-green-600",
      warning: "border-transparent bg-amber-500 text-white hover:bg-amber-600",
      info: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
      purple: "border-transparent bg-purple-500 text-white hover:bg-purple-600"
    }

    return (
      <div
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          variantClasses[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
