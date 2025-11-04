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
  params: { lang } 
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  return (
    <html lang={lang}> 
      <body className={spaceMono.className}>
        {children}
      </body>
    </html>
  );
}