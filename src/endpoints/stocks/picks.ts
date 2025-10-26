import { OpenAPIRoute, contentJson } from "chanfana";
import { AppContext } from "../../types";
import { z } from "zod";
import { StockScannerService, ScannerConfig } from "../../services/stockScanner";

export class StockPicksEndpoint extends OpenAPIRoute {
  public schema = {
    tags: ["Stocks"],
    summary: "Get AI-generated stock picks",
    description: "Returns stock picks based on sentiment analysis, market data, and other signals",
    operationId: "get-stock-picks",
    request: {
      query: z.object({
        min_confidence: z.string().optional().transform(val => val ? parseFloat(val) : 0.6),
        limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
      }),
    },
    responses: {
      "200": {
        description: "Stock picks retrieved successfully",
        ...contentJson({
          success: z.boolean(),
          result: z.object({
            picks: z.array(z.object({
              symbol: z.string(),
              companyName: z.string(),
              confidenceScore: z.number(),
              sentimentScore: z.number(),
              price: z.number(),
              volume: z.number(),
              priceChangePercent: z.number(),
              reasoning: z.array(z.string()),
              dataSources: z.array(z.string()),
              isPremarket: z.boolean(),
              pickDate: z.string(),
            })),
            count: z.number(),
            timestamp: z.string(),
          }),
        }),
      },
    },
  };

  public async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const { min_confidence, limit } = data.query;

    // Get configuration (in production, this would come from database)
    const config: ScannerConfig = {
      minConfidenceScore: min_confidence,
      minVolumeThreshold: 1000000,
      sentimentSources: ["twitter", "reddit", "news"],
      sectors: ["Technology", "Healthcare", "Finance"],
      keywords: ["earnings", "merger", "FDA approval"],
    };

    const scannerService = new StockScannerService();
    const picks = await scannerService.scanStocks(config);

    // Limit results
    const limitedPicks = picks.slice(0, limit);

    return {
      success: true,
      result: {
        picks: limitedPicks,
        count: limitedPicks.length,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
