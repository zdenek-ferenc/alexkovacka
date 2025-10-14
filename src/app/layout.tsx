
import type { Metadata } from "next";
import { Space_Mono } from "next/font/google"; 
import "./globals.css";


const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"], 
});

export const metadata: Metadata = {
  title: "Alexander Kovačka",
  description: "Portfolio fotografa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={spaceMono.className}>{children}</body>
    </html>
  );
}