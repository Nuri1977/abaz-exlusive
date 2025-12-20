import {
  ExchangeRateService,
  type Currency,
  type ExchangeRates,
} from "@/services/exchange-rate";

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  MKD: "ден",
  USD: "$",
  EUR: "€",
};

export type { Currency, ExchangeRates };

export function getCurrencySymbol(currency: Currency) {
  return CURRENCY_SYMBOLS[currency] ?? currency;
}

/**
 * Fetch exchange rates (uses database-backed service with 24-hour refresh)
 */
export async function fetchExchangeRates(
  base: Currency = "MKD"
): Promise<ExchangeRates> {
  return await ExchangeRateService.getExchangeRates(base);
}

/**
 * Force refresh exchange rates (bypasses cache)
 */
export async function forceRefreshExchangeRates(
  base: Currency = "MKD"
): Promise<ExchangeRates> {
  return await ExchangeRateService.forceRefresh(base);
}
