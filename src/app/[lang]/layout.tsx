import { getDictionary } from '@/lib/getDictionary';
import { DictionaryProvider } from '../contexts/DictionaryContext';

type LangLayoutParams = {
  children: React.ReactNode;
  params: { lang: 'cs' | 'en' };
};

export async function generateStaticParams() {
  return [{ lang: 'cs' }, { lang: 'en' }];
}

export default async function LangLayout({ children, params: { lang } }: LangLayoutParams) {
  
  const dictionary = await getDictionary(lang);
  
  return (
    <DictionaryProvider dictionary={dictionary}>
      {children}
    </DictionaryProvider>
  );
}