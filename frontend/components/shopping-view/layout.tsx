import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ShoppingHeader from "@/components/header";
import { CartProvider } from "@/context/cart-context";
import { AuthProvider } from "@/context/auth-context";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ecommerce",
  description: "An ecommerce platform built with Next.js.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white`}>
        <AuthProvider>
          <CartProvider>
            <ShoppingHeader />
            <main className="w-full flex flex-col">{children}</main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
