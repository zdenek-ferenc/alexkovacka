import { getDictionary } from '@/lib/getDictionary';

export type AppDictionary = Awaited<ReturnType<typeof getDictionary>>;