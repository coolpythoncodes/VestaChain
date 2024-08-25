import "@/styles/globals.css";

import { Inter } from 'next/font/google';
import { type Metadata } from "next";
import { cn } from '@/lib/utils'
import Footer from "./components/footer";
import Navbar from "./components/navbar";
import { AppKit } from "@/context/web3modal";

export const metadata: Metadata = {
  title: "VestaChain",
  description: "Token Vesting Dapp",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const fontHeading = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
})

const fontBody = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={cn(
          'antialiased',
          fontHeading.variable,
          fontBody.variable
        )}
      >
        <AppKit>
          <div className="flex flex-col min-h-dvh bg-background text-foreground">
            <Navbar />
            {children}
            <Footer />
          </div>
        </AppKit>
      </body>
    </html>
  );
}
