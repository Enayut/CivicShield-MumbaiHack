import * as React from "react"
import { cn } from "@/lib/utils"

function GradientCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className="p-[2px] rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
      <div
        data-slot="gradient-card"
        className={cn(
          "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-transparent py-6 shadow-sm",
          className
        )}
        {...props}
      />
    </div>
  )
}

function GradientCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="gradient-card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function GradientCardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="gradient-card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function GradientCardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="gradient-card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function GradientCardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="gradient-card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function GradientCardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="gradient-card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function GradientCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="gradient-card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  GradientCard,
  GradientCardHeader,
  GradientCardFooter,
  GradientCardTitle,
  GradientCardAction,
  GradientCardDescription,
  GradientCardContent,
}
