import { Prisma } from "@prisma/client";
import axios from "axios";

import { type Currency, type ExchangeRates } from "@/types/currency";
import { prisma } from "@/lib/prisma";

export type { Currency, ExchangeRates };

const API_BASE =
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/";
const FALLBACK_BASE = "https://latest.currency-api.pages.dev/v1/currencies/";

// Hardcoded fallback rates (last resort if APIs and DB fail)
// Last updated: December 20, 2025
const HARDCODED_FALLBACK_RATES: Record<Currency, ExchangeRates> = {
  MKD: { MKD: 1, USD: 0.019, EUR: 0.0162 },
  USD: { MKD: 52.54, USD: 1, EUR: 0.85 },
  EUR: { MKD: 61.53, USD: 1.16, EUR: 1 },
};

// 24 hours refresh interval
const REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

export class ExchangeRateService {
  /**
   * Get exchange rates for a base currency
   * Priority: Database (if fresh) → API → Hardcoded fallback
   */
  static async getExchangeRates(
    base: Currency = "MKD"
  ): Promise<ExchangeRates> {
    try {
      // Step 1: Try to get fresh rates from database
      const dbRates = await this.getFromDatabase(base);

      if (dbRates && this.isRateFresh(dbRates.expiresAt)) {
        console.log(`[ExchangeRate] Using database rates for ${base}`);
        return this.formatDatabaseRates(dbRates);
      }

      // Step 2: Fetch fresh rates from API
      console.log(
        `[ExchangeRate] Database rates expired, fetching from API for ${base}`
      );
      const apiRates = await this.fetchFromAPI(base);

      // Step 3: Save to database
      await this.saveToDatabase(base, apiRates);

      return apiRates;
    } catch (error) {
      console.error(`[ExchangeRate] Error getting rates for ${base}:`, error);

      // Step 4: Try to get any rates from database (even expired)
      const anyDbRates = await this.getFromDatabase(base, false);
      if (anyDbRates) {
        console.warn(`[ExchangeRate] Using expired database rates for ${base}`);
        return this.formatDatabaseRates(anyDbRates);
      }

      // Step 5: Use hardcoded fallback
      console.error(
        `[ExchangeRate] All sources failed, using hardcoded rates for ${base}`
      );
      return HARDCODED_FALLBACK_RATES[base];
    }
  }

  /**
   * Fetch rates from external API
   */
  private static async fetchFromAPI(base: Currency): Promise<ExchangeRates> {
    const endpoint = `${base.toLowerCase()}.json`;

    try {
      // Try primary API
      const res = await axios.get<Record<string, unknown>>(
        `${API_BASE}${endpoint}`,
        {
          timeout: 5000,
        }
      );
      const rawData = res.data;
      const baseKey = base.toLowerCase();
      const data = (rawData[baseKey] || rawData) as Record<string, number>;

      return {
        MKD: data?.mkd ?? 1,
        USD: data?.usd ?? 1,
        EUR: data?.eur ?? 1,
      };
    } catch (primaryError) {
      console.warn(
        `[ExchangeRate] Primary API failed, trying fallback...`,
        primaryError
      );

      // Try fallback API
      const res = await axios.get<Record<string, unknown>>(
        `${FALLBACK_BASE}${endpoint}`,
        {
          timeout: 5000,
        }
      );
      const rawData = res.data;
      const baseKey = base.toLowerCase();
      const data = (rawData[baseKey] || rawData) as Record<string, number>;

      return {
        MKD: data?.mkd ?? 1,
        USD: data?.usd ?? 1,
        EUR: data?.eur ?? 1,
      };
    }
  }

  /**
   * Get rates from database
   */
  private static async getFromDatabase(
    base: Currency,
    onlyActive: boolean = true
  ): Promise<{
    MKD: Prisma.Decimal;
    USD: Prisma.Decimal;
    EUR: Prisma.Decimal;
    expiresAt: Date;
  } | null> {
    const rates = await prisma.exchangeRate.findMany({
      where: {
        baseCurrency: base,
        ...(onlyActive && {
          isActive: true,
          expiresAt: { gte: new Date() },
        }),
      },
      orderBy: { fetchedAt: "desc" },
      take: 3, // Get MKD, USD, EUR rates
    });

    if (rates.length === 0) return null;

    const rateMap: Record<string, Prisma.Decimal | Date> = {
      expiresAt: rates[0]?.expiresAt ?? new Date(),
    };
    rates.forEach((r) => {
      rateMap[r.targetCurrency] = r.rate;
    });

    // Ensure all currencies are present
    if (!rateMap.MKD || !rateMap.USD || !rateMap.EUR) return null;

    return rateMap as unknown as {
      MKD: Prisma.Decimal;
      USD: Prisma.Decimal;
      EUR: Prisma.Decimal;
      expiresAt: Date;
    };
  }

  /**
   * Save rates to database
   */
  private static async saveToDatabase(
    base: Currency,
    rates: ExchangeRates
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + REFRESH_INTERVAL);
    const fetchedAt = new Date();

    // Deactivate old rates
    await prisma.exchangeRate.updateMany({
      where: { baseCurrency: base, isActive: true },
      data: { isActive: false },
    });

    // Insert new rates
    const currencies: Currency[] = ["MKD", "USD", "EUR"];

    await Promise.all(
      currencies.map((target) =>
        prisma.exchangeRate.create({
          data: {
            baseCurrency: base,
            targetCurrency: target,
            rate: new Prisma.Decimal(rates[target]),
            source: "api",
            fetchedAt,
            expiresAt,
            isActive: true,
          },
        })
      )
    );

    console.log(`[ExchangeRate] Saved fresh rates to database for ${base}`);
  }

  /**
   * Check if rate is still fresh
   */
  private static isRateFresh(expiresAt: Date): boolean {
    return new Date() < expiresAt;
  }

  /**
   * Format database rates to ExchangeRates object
   */
  private static formatDatabaseRates(dbRates: {
    MKD: Prisma.Decimal;
    USD: Prisma.Decimal;
    EUR: Prisma.Decimal;
  }): ExchangeRates {
    return {
      MKD: Number(dbRates.MKD),
      USD: Number(dbRates.USD),
      EUR: Number(dbRates.EUR),
    };
  }

  /**
   * Manually refresh rates (for admin use)
   */
  static async forceRefresh(base: Currency = "MKD"): Promise<ExchangeRates> {
    console.log(`[ExchangeRate] Force refreshing rates for ${base}`);

    const apiRates = await this.fetchFromAPI(base);
    await this.saveToDatabase(base, apiRates);

    return apiRates;
  }

  /**
   * Get all active rates from database (for admin dashboard)
   */
  static async getAllActiveRates() {
    return await prisma.exchangeRate.findMany({
      where: { isActive: true },
      orderBy: [{ baseCurrency: "asc" }, { targetCurrency: "asc" }],
    });
  }

  /**
   * Get rate history (for analytics)
   */
  static async getRateHistory(
    baseCurrency: Currency,
    targetCurrency: Currency,
    days: number = 30
  ) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return await prisma.exchangeRate.findMany({
      where: {
        baseCurrency,
        targetCurrency,
        fetchedAt: { gte: since },
      },
      orderBy: { fetchedAt: "desc" },
    });
  }
}
