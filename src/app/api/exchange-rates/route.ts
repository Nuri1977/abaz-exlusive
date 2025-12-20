import { NextResponse } from "next/server";

import { type Currency } from "@/types/currency";
import { ExchangeRateService } from "@/services/exchange-rate";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = (searchParams.get("base") || "MKD") as Currency;

  try {
    const rates = await ExchangeRateService.getExchangeRates(base);
    return NextResponse.json(rates);
  } catch (error) {
    console.error("[API Exchange Rates] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exchange rates" },
      { status: 500 }
    );
  }
}
