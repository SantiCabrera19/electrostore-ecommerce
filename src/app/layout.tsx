import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import SiteHeader from "@/components/layout/SiteHeader"
import SiteFooter from "@/components/layout/SiteFooter"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})


export const metadata: Metadata = {
  title: "ElectroStore - Tu tienda de electrónicos",
  description: "Encuentra los mejores productos electrónicos al mejor precio",
  generator: "v0.app",
  icons: {
    icon: '/electrostore_Logo.png',
    shortcut: "/electrostore_Logo.png",
    apple: "/electrostore_Logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans">
        <div className="min-h-screen flex flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          {/* NUEVO: Footer global */}
          {/* Importa el componente */}
          {/* import SiteFooter from "@/components/layout/SiteFooter" */}
          <SiteFooter />
        </div>
        <Toaster />
      </body>
    </html>
  )
}
