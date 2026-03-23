import { normalizeCountry, normalizeLanguage } from './text';

export interface ResolvedLocale {
  language: string;
  country: string;
}

export type SupportedEmailLanguage = 'en' | 'sv';

const DEFAULT_LANGUAGE = 'en';
const DEFAULT_COUNTRY = 'US';

const defaultCountryByLanguage: Record<string, string> = {
  ar: 'SA',
  cs: 'CZ',
  da: 'DK',
  de: 'DE',
  el: 'GR',
  en: 'US',
  es: 'ES',
  fi: 'FI',
  fr: 'FR',
  he: 'IL',
  hi: 'IN',
  hu: 'HU',
  id: 'ID',
  it: 'IT',
  ja: 'JP',
  ko: 'KR',
  nb: 'NO',
  nl: 'NL',
  nn: 'NO',
  no: 'NO',
  pl: 'PL',
  pt: 'PT',
  ro: 'RO',
  ru: 'RU',
  sk: 'SK',
  sv: 'SE',
  th: 'TH',
  tr: 'TR',
  uk: 'UA',
  vi: 'VN',
  zh: 'CN'
};

function normalizeLanguageTag(value: string | null | undefined): string | null {
  const normalized = normalizeLanguage(value);
  return normalized ? normalized.replaceAll('_', '-') : null;
}

function getLanguageBase(value: string | null | undefined): string | null {
  const normalized = normalizeLanguageTag(value);

  if (!normalized) {
    return null;
  }

  const [base] = normalized.split('-');
  return base || null;
}

function getCountryFromLanguageTag(value: string | null | undefined): string | null {
  const normalized = normalizeLanguageTag(value);

  if (!normalized) {
    return null;
  }

  const parts = normalized.split('-');

  if (parts.length < 2) {
    return null;
  }

  const regionPart = parts.at(-1);

  if (!regionPart || regionPart.length !== 2) {
    return null;
  }

  return normalizeCountry(regionPart);
}

export function inferCountryFromLanguage(language: string | null | undefined): string | null {
  const countryFromTag = getCountryFromLanguageTag(language);

  if (countryFromTag) {
    return countryFromTag;
  }

  const baseLanguage = getLanguageBase(language);
  return baseLanguage ? defaultCountryByLanguage[baseLanguage] ?? null : null;
}

export function resolveLocale(input: {
  language?: string | null;
  country?: string | null;
  fallbackLanguage?: string | null;
  fallbackCountry?: string | null;
} = {}): ResolvedLocale {
  const language =
    normalizeLanguageTag(input.language) ??
    normalizeLanguageTag(input.fallbackLanguage) ??
    DEFAULT_LANGUAGE;
  const country =
    normalizeCountry(input.country) ??
    inferCountryFromLanguage(input.language) ??
    normalizeCountry(input.fallbackCountry) ??
    inferCountryFromLanguage(input.fallbackLanguage) ??
    inferCountryFromLanguage(language) ??
    DEFAULT_COUNTRY;

  return {
    language,
    country
  };
}

export function ensureUserLocale(
  user: {
    language?: string | null;
    country?: string | null;
  },
  fallback: {
    language?: string | null;
    country?: string | null;
  } = {}
): ResolvedLocale & { changed: boolean } {
  const currentLanguage = normalizeLanguageTag(user.language);
  const currentCountry = normalizeCountry(user.country);
  const resolvedLocale = resolveLocale({
    language: currentLanguage,
    country: currentCountry,
    fallbackLanguage: fallback.language,
    fallbackCountry: fallback.country
  });

  let changed = false;

  if (user.language !== resolvedLocale.language) {
    user.language = resolvedLocale.language;
    changed = true;
  }

  if (user.country !== resolvedLocale.country) {
    user.country = resolvedLocale.country;
    changed = true;
  }

  return {
    ...resolvedLocale,
    changed
  };
}

export function getSupportedEmailLanguage(
  language: string | null | undefined
): SupportedEmailLanguage {
  return getLanguageBase(language) === 'sv' ? 'sv' : 'en';
}
