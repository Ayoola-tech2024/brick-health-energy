import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brick Health Energy Solutions",
  description: "Premium Cleantech Products",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
        <CartDrawer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}

