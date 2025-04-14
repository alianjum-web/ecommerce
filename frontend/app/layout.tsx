// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Ecommerce",
    template: "%s | Ecommerce",
  },
  description: "Your ecommerce platform description",
  keywords: ["ecommerce", "shopping", "online store"],
  authors: [{ name: "Your Name" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* <body> */}
        
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
      {/* </body> */}
    </html>
  );
}