import type { Metadata } from "next";
import "@/app/globals.css";
import { getDictionary, Locale } from "@/lib/getDictionary";
import { DictionaryProvider } from "@/app/contexts/DictionaryContext";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Alex Kováčová - Fotografka",
  description:
    "Profesionální fotografka specializující se na portréty, svatby a komerční fotografii.",
};

export type LangLayoutParams = {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
};


export async function generateStaticParams() {
  return [{ lang: "cs" }, { lang: "en" }];
}


export default async function RootLayout({ children, params }: LangLayoutParams) {
  const { lang } = await params; 
  const dictionary = await getDictionary(lang);

  return (
    <DictionaryProvider dictionary={dictionary}>
      {children}
    </DictionaryProvider>
  );
}