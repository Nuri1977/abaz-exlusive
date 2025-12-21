import { NextResponse, type NextRequest } from "next/server";

import { ExchangeRateService } from "@/services/exchange-rate";
import { getSessionServer } from "@/helpers/getSessionServer";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  try {
    const session = await getSessionServer();

    // Check admin permission
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rates = await ExchangeRateService.getAllActiveRates();

    return NextResponse.json({ rates });
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch exchange rates" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionServer();

    // Check admin permission
    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { action?: string; currency?: string };
    const { action, currency } = body;

    if (action === "refresh") {
      const base = (currency as "MKD" | "USD" | "EUR") || "MKD";
      const rates = await ExchangeRateService.forceRefresh(base);

      return NextResponse.json({
        success: true,
        message: `Exchange rates refreshed for ${base}`,
        rates,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error refreshing exchange rates:", error);
    return NextResponse.json(
      { error: "Failed to refresh exchange rates" },
      { status: 500 }
    );
  }
}
