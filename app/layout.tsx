import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShiftSmart — Team Communication for Shift Workers",
  description:
    "Persistent team channels for fast food, retail, and hospitality. No more rebuilding group chats when someone leaves.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0F0F0F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${inter.variable} h-full`}
    >
      <body className="h-full bg-[#0F0F0F] text-[#F5F5F5] antialiased">
        {children}
      </body>
    </html>
  );
}
