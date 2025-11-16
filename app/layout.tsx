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

export const metadata: Metadata = {
  title: "Jenna Li Hoi Wah",
  description: "Welcome to my personal portfolio website",
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
        {children}
      </body>
    </html>
  );
}
<footer className="bg-gray-900 text-white p-6 text-center">
  <p>© {new Date().getFullYear()} Jenna LHW. All rights reserved.</p>
  <p>
    <a href="https://github.com/Jenna-LHW" target="_blank" rel="noopener noreferrer" className="underline mx-2">GitHub</a>
    |
    <a href="https://www.linkedin.com/in/jenna-lhw/" target="_blank" rel="noopener noreferrer" className="underline mx-2">LinkedIn</a>
  </p>
  <p className="mt-2 text-sm">Built with Next.js & Supabase</p>
</footer>

