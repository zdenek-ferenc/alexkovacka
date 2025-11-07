import { Space_Mono } from "next/font/google"; 
import "./globals.css";
import { ReactNode } from "react";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "Alexander Kovačka - Fotograf",
  description: "Profesionální fotograf specializující se na portréty a komerční fotografii.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="cs">
      <body className={spaceMono.className}>
        {children}
      </body>
    </html>
  );
}