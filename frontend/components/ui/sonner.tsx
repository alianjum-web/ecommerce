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

  // Change toast color
  // return (
  //   <Sonner
  //     theme={theme as ToasterProps["theme"]}
  //     className="toaster group"
  //     toastOptions={{
  //       classNames: {
  //         toast: `
  //           !relative !p-4 !rounded-lg !border !shadow-lg !z-[1000]
  //           group-[.toaster]:bg-background 
  //           group-[.toaster]:text-foreground
  //           group-[.toaster]:border-border
  //         `,
  //         title: "!text-sm !font-medium",
  //         description: "!text-sm !opacity-90",
  //         error: `
  //           !bg-destructive !text-destructive-foreground
  //           !border-destructive/30
  //         `,
  //         success: `
  //           !bg-emerald-500 !text-white
  //           !border-emerald-500/30
  //         `,
  //         // Default toast - neutral
  //         default: `
  //           group-[.toast-default]:bg-background 
  //           group-[.toast-default]:text-foreground
  //           group-[.toast-default]:border-border
  //         `,
  //         // Info toast - blue
  //         info: `
  //           group-[.toast-info]:bg-blue-500 
  //           group-[.toast-info]:text-white
  //           group-[.toast-info]:border-blue-500/30
  //         `,
  //         // Warning toast - amber
  //         warning: `
  //           group-[.toast-warning]:bg-amber-500 
  //           group-[.toast-warning]:text-white
  //           group-[.toast-warning]:border-amber-500/30
  //         `,
  //         actionButton: `
  //           group-[.toast]:bg-primary 
  //           group-[.toast]:text-primary-foreground
  //         `,
  //         cancelButton: `
  //           group-[.toast]:bg-muted 
  //           group-[.toast]:text-muted-foreground
  //         `,
  //       }
  //     }}
  //     {...props}
  //   />
  // )
}


// Export the original Sonner toast function directly
export { Toaster, toast }