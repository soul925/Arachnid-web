import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"

// This application requires the OPENAI_API_KEY environment variable to be set
// for the AI assistant functionality to work properly.

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hexa Bot Rescue Operation",
  description: "Control dashboard for Hexa Bot rescue operations",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
