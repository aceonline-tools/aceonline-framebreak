import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ace Online — Tính đạn AG",
  description: "Tính đạn trên giây cho vũ khí A-Gear trong Ace Online với các lựa chọn sup đầu, sup đuôi, và thẻ tăng cường.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full overflow-x-hidden antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">{children}</body>
    </html>
  );
}
