import { OpenAPIRoute, contentJson } from "chanfana";
import { AppContext } from "../../types";
import { z } from "zod";
import { MarketDataService } from "../../services/marketData";

export class PremarketEndpoint extends OpenAPIRoute {
  public schema = {
    tags: ["Stocks"],
    summary: "Get premarket top movers and volume spikes",
    description: "Returns premarket data including top gainers, losers, and volume spikes",
    operationId: "get-premarket-data",
    responses: {
      "200": {
        description: "Premarket data retrieved successfully",
        ...contentJson({
          success: z.boolean(),
          result: z.object({
            topGainers: z.array(z.object({
              symbol: z.string(),
              price: z.number(),
              change: z.number(),
              changePercent: z.number(),
              volume: z.number(),
              companyName: z.string().optional(),
            })),
            topLosers: z.array(z.object({
              symbol: z.string(),
              price: z.number(),
              change: z.number(),
              changePercent: z.number(),
              volume: z.number(),
              companyName: z.string().optional(),
            })),
            volumeSpikes: z.array(z.object({
              symbol: z.string(),
              price: z.number(),
              change: z.number(),
              changePercent: z.number(),
              volume: z.number(),
              companyName: z.string().optional(),
            })),
            timestamp: z.string(),
          }),
        }),
      },
    },
  };

  public async handle(c: AppContext) {
    const marketDataService = new MarketDataService();
    const premarketData = await marketDataService.getPremarketData();

    return {
      success: true,
      result: premarketData,
    };
  }
}
