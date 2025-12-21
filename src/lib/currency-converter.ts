import { Currency, ExchangeRates } from "@/services/exchange-rate";

export class CurrencyConverter {
  /**
   * Convert amount from one currency to another
   */
  static convert(
    amount: number,
    from: Currency,
    to: Currency,
    rates: ExchangeRates
  ): number {
    if (from === to) return amount;

    // We assume 'rates' are based on MKD (or whatever the rates object's base was)
    // But actually, the service returns rates for A SPECIFIC base if we called getExchangeRates(base).

    // If we passed rates relative to MKD:
    // 1 MKD = rates.USD USD
    // 1 MKD = rates.EUR EUR

    // Convert 'from' to MKD first
    const amountInMKD = from === "MKD" ? amount : amount / rates[from];

    // Convert MKD to 'to'
    const convertedAmount =
      to === "MKD" ? amountInMKD : amountInMKD * rates[to];

    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimals
  }

  /**
   * Convert to USD for Polar (Polar only supports USD)
   */
  static convertToPolarCurrency(
    amount: number,
    from: Currency,
    rates: ExchangeRates
  ): {
    originalAmount: number;
    originalCurrency: Currency;
    convertedAmount: number;
    convertedCurrency: "USD";
    exchangeRate: number;
  } {
    const convertedAmount = this.convert(amount, from, "USD", rates);

    // Exchange rate: how many USD per 1 unit of original currency
    // if from MKD: rates.USD
    // if from EUR: rates.USD / rates.EUR
    const exchangeRate = from === "MKD" ? rates.USD : rates.USD / rates[from];

    return {
      originalAmount: amount,
      originalCurrency: from,
      convertedAmount,
      convertedCurrency: "USD",
      exchangeRate,
    };
  }

  /**
   * Format price with currency symbol
   */
  static formatPrice(amount: number, currency: Currency): string {
    const locales: Record<Currency, string> = {
      MKD: "mk-MK",
      USD: "en-US",
      EUR: "de-DE",
    };

    return new Intl.NumberFormat(locales[currency], {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}
