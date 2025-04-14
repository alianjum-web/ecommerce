"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, toast, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast",
          title: "text-sm font-medium",
          description: "text-sm opacity-90",
          error: "group-[.toast-error]:bg-destructive group-[.toast-error]:text-destructive-foreground",
        }
      }}
      {...props}
    />
  )
}

// Export the original Sonner toast function directly
export { Toaster, toast }