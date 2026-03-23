import {
  CREDIT_TOP_UP_PRICES,
  type CreditTopUpPrice,
  type SupportedTopUpCurrency
} from '../../app-config';
import { normalizeCountry } from '../../utils/text';

export const DEFAULT_TOP_UP_CURRENCY: SupportedTopUpCurrency = 'EUR';

const topUpCurrencyByCountry: Partial<Record<string, SupportedTopUpCurrency>> = {
  DK: 'DKK',
  NO: 'NOK',
  SE: 'SEK'
};

export interface CreditTopUpPackage extends CreditTopUpPrice {
  id: string;
  currency: SupportedTopUpCurrency;
  unitAmount: number;
}

export interface CreditTopUpCatalog {
  currency: SupportedTopUpCurrency;
  packages: CreditTopUpPackage[];
}

export function resolveTopUpCurrency(country: string | null | undefined): SupportedTopUpCurrency {
  const normalizedCountry = normalizeCountry(country);

  if (!normalizedCountry) {
    return DEFAULT_TOP_UP_CURRENCY;
  }

  return topUpCurrencyByCountry[normalizedCountry] ?? DEFAULT_TOP_UP_CURRENCY;
}

export function buildCreditTopUpPackageId(
  currency: SupportedTopUpCurrency,
  credits: number
): string {
  return `${currency.toLowerCase()}-${credits}`;
}

export function getCreditTopUpCatalog(country: string | null | undefined): CreditTopUpCatalog {
  const currency = resolveTopUpCurrency(country);
  const prices = CREDIT_TOP_UP_PRICES[currency];

  return {
    currency,
    packages: prices.map((entry) => ({
      ...entry,
      id: buildCreditTopUpPackageId(currency, entry.credits),
      currency,
      unitAmount: toMinorUnit(entry.price)
    }))
  };
}

export function findCreditTopUpPackage(
  country: string | null | undefined,
  packageId: string
): CreditTopUpPackage | null {
  const catalog = getCreditTopUpCatalog(country);

  return catalog.packages.find((entry) => entry.id === packageId) ?? null;
}

function toMinorUnit(value: number): number {
  return Math.round(value * 100);
}
