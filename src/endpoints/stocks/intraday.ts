import { OpenAPIRoute, contentJson } from "chanfana";
import { AppContext } from "../../types";
import { z } from "zod";
import { MarketDataService } from "../../services/marketData";

export class IntradayEndpoint extends OpenAPIRoute {
  public schema = {
    tags: ["Stocks"],
    summary: "Get intraday runners and momentum stocks",
    description: "Returns stocks making significant moves during trading hours including runners, breakouts, and volume leaders",
    operationId: "get-intraday-data",
    responses: {
      "200": {
        description: "Intraday data retrieved successfully",
        ...contentJson({
          success: z.boolean(),
          result: z.object({
            topRunners: z.array(z.object({
              symbol: z.string(),
              price: z.number(),
              change: z.number(),
              changePercent: z.number(),
              volume: z.number(),
              companyName: z.string().optional(),
            })),
            breakoutStocks: z.array(z.object({
              symbol: z.string(),
              price: z.number(),
              change: z.number(),
              changePercent: z.number(),
              volume: z.number(),
              companyName: z.string().optional(),
            })),
            volumeLeaders: z.array(z.object({
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
    const intradayData = await marketDataService.getIntradayData();

    return {
      success: true,
      result: intradayData,
    };
  }
}
