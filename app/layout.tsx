import type React from "react"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Providers } from "./providers"
import { DataProvider } from "@/context/data-context"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { LayoutWrapper } from "@/components/wrappers/LayoutWrapper"
import { DataInitializer } from "@/components/wrappers/DataInitializer"
import { Roboto, Roboto_Condensed, Open_Sans } from "next/font/google"

// Define the fonts
const roboto = Roboto({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
})

const robotoCondensed = Roboto_Condensed({
  weight: ["300", "400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-condensed",
})

const openSans = Open_Sans({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
})

// Update the metadata section with the correct favicon URLs
export const metadata = {
  title: "Athena",
  description: "A dashboard for venture capital firms and startups",
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "https://g24kvg1wyx9lx0lb.public.blob.vercel-storage.com/Favicons/favicon-xjaIPGl81jIiBIYnLhIVGqyxpgWdnF.ico",
        sizes: "64x64 32x32 24x24 16x16",
      },
      {
        url: "https://g24kvg1wyx9lx0lb.public.blob.vercel-storage.com/Favicons/icon-PLGaEQSTPK1LpCmlxBxbXqGb9jMThx.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "https://g24kvg1wyx9lx0lb.public.blob.vercel-storage.com/Favicons/icon-FmTlZh10BrvNQl8Mwg1gbghEETvhvz.svg",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "https://g24kvg1wyx9lx0lb.public.blob.vercel-storage.com/Favicons/apple-icon-sySNfhepnUvJ03YCM2qLhfrwmc1WzT.png",
        sizes: "180x180",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Athena",
  },
    generator: 'v0.app'
}


export default function RootLayout({children}
  : { 
    children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${roboto.variable} ${robotoCondensed.variable} ${openSans.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${roboto.className} antialiased`}>
        <Providers>
          <ThemeProvider>
            <DataProvider>
              <TooltipProvider>
                <DataInitializer />
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
                <Toaster />
              </TooltipProvider>
            </DataProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}

