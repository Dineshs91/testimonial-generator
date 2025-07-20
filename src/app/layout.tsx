import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { VemetricScript } from '@vemetric/react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Testimonial Generator - Create Beautiful Testimonials from Social Posts",
  description: "Transform your Twitter/X posts into beautiful testimonial widgets for your website.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <VemetricScript token={process.env.NEXT_PUBLIC_VEMETRIC_TOKEN || ''} />
        {children}
      </body>
    </html>
  );
}
