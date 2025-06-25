import axios from "axios";

export type Currency = "MKD" | "USD" | "EUR";

export type ExchangeRates = {
  MKD: number;
  USD: number;
  EUR: number;
};

const API_BASE =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/";
const FALLBACK_BASE = "https://latest.currency-api.pages.dev/v1/currencies/";

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  MKD: "ден",
  USD: "$",
  EUR: "€",
};

export function getCurrencySymbol(currency: Currency) {
  return CURRENCY_SYMBOLS[currency] ?? currency;
}

export async function fetchExchangeRates(
  base: Currency = "MKD"
): Promise<ExchangeRates> {
  const endpoint = `${base.toLowerCase()}.json`;
  let data;
  try {
    const res = await axios.get(`${API_BASE}${endpoint}`);
    data = res.data?.[base.toLowerCase()] ?? res.data;
  } catch {
    // fallback
    const res = await axios.get(`${FALLBACK_BASE}${endpoint}`);
    data = res.data?.[base.toLowerCase()] ?? res.data;
  }
  // Always return rates for MKD, USD, EUR (relative to base)
  return {
    MKD: data?.mkd ?? 1,
    USD: data?.usd ?? 1,
    EUR: data?.eur ?? 1,
  };
}
