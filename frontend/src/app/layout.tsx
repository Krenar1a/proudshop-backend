import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";
import LiveChatWidget from "@/components/LiveChatWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Proudshop - Dyqan Online për Shqipërinë dhe Kosovën",
  description: "Dyqani më i mirë online me produkte të cilësisë së lartë për Shqipërinë dhe Kosovën. Dërgim i shpejtë dhe çmime të mira.",
  keywords: "dyqan online, Shqipëri, Kosovë, produkte, blerje online, Proudshop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sq" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <Toaster position="top-right" />
          <LiveChatWidget />
        </Providers>
      </body>
    </html>
  );
}
