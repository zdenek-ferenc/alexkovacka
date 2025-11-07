import type { Metadata } from "next";
import "@/app/globals.css";
import { getDictionary, Locale } from "@/lib/getDictionary";
import { DictionaryProvider } from "@/app/contexts/DictionaryContext";


export const metadata: Metadata = {
  title: "Alexander Kovačka - Fotograf",
  description:
    "Fotograf specializující se na portréty a komerční fotografii.",
};

export type LangLayoutParams = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>; 
};


export async function generateStaticParams() {
  return [{ lang: "cs" }, { lang: "en" }];
}


export default async function RootLayout({ children, params }: LangLayoutParams) {
  const { lang } = await params;
  const locale = lang as Locale; 

  const dictionary = await getDictionary(locale);

  return (
    <DictionaryProvider dictionary={dictionary}>
      {children}
    </DictionaryProvider>
  );
}