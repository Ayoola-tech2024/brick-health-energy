import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { Providers } from "@/components/layout/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://brickhealthenergy.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | Brick Health Energy",
    default: "Brick Health Energy",
  },
  description: "Premium smokeless biomass stoves and eco-friendly fuels — engineered for healthy cooking and a sustainable future.",
  keywords: ["biomass stoves", "smokeless stove", "eco fuel", "clean cooking", "Nigeria", "sustainable energy", "Brick Health Energy"],
  authors: [{ name: "Brick Health Energy" }],
  creator: "Brick Health Energy",
  publisher: "Brick Health Energy",
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "Brick Health Energy",
    title: "Brick Health Energy",
    description: "Premium smokeless biomass stoves and eco-friendly fuels — engineered for healthy cooking and a sustainable future.",
    url: siteUrl,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brick Health Energy",
    description: "Premium smokeless biomass stoves and eco-friendly fuels — engineered for healthy cooking and a sustainable future.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable} ${playfair.variable}`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <Header />
          <main className="flex-1 pt-20">{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppFloat />
        </Providers>
      </body>
    </html>
  );
}

