import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { ToasterProvider } from "@/components/ui/toaster-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Community OS - AI Sync Day 2025",
  description: "Transform passive guest lists into an active, searchable network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToasterProvider>
          <div className="min-h-screen bg-white">
            <Navbar />
            <main>
              <div className="container mx-auto px-4 py-8">
                {children}
              </div>
            </main>
          </div>
        </ToasterProvider>
      </body>
    </html>
  );
}

