import { type Currency, type ExchangeRates } from "@/types/currency";

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
 * Fetch exchange rates via API (compat with client/server)
 */
export async function fetchExchangeRates(
  base: Currency = "MKD"
): Promise<ExchangeRates> {
  const res = await fetch(`/api/exchange-rates?base=${base}`);
  if (!res.ok) {
    throw new Error("Failed to fetch exchange rates");
  }
  const data = (await res.json()) as ExchangeRates;
  return data;
}
