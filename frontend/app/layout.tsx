// frontend/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI SaaS Generator",
  description: "Powered by Gemini & Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-white antialiased`}>
        {children}
        <Toaster 
           position="top-right"
           toastOptions={{
             style: {
               background: '#1f2937', // bg-gray-800
               color: '#fff',
               border: '1px solid #374151', // border-gray-700
             },
           }}
        />
      </body>
    </html>
  );
}