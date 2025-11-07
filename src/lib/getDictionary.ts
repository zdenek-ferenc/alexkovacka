import 'server-only';

export type Locale = 'cs' | 'en';

const dictionaries = {
  cs: () => import('@/dictionaries/cs.json').then((module) => module.default),
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale] ? dictionaries[locale]() : dictionaries.cs();
}

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;