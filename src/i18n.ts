import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';
 
export const locales = ['en', 'pl'];

export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async (params) => {
  const locale = await params.requestLocale;
 
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    locale: locale, // Add this line to explicitly return the locale
  };
});