import type { Metadata } from "next";
import { Playfair_Display, Inter, Cairo } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Our Love Scrapbook | Forever & Always",
  description: "A luxury digital love scrapbook capturing our beautiful moments together.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <body
        className={`${playfair.variable} ${inter.variable} ${cairo.variable} font-inter antialiased bg-pastelBg text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
