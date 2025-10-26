import { OpenAPIRoute, contentJson } from "chanfana";
import { AppContext } from "../../types";
import { z } from "zod";
import { StockScannerService, ScannerConfig } from "../../services/stockScanner";
import { TwitterService } from "../../services/twitter";

export class ScanEndpoint extends OpenAPIRoute {
  public schema = {
    tags: ["Stocks"],
    summary: "Trigger a stock scan",
    description: "Manually trigger the stock scanner algorithm and optionally tweet results",
    operationId: "trigger-stock-scan",
    request: {
      body: contentJson(
        z.object({
          min_confidence: z.number().min(0).max(1).optional().default(0.6),
          tweet_results: z.boolean().optional().default(false),
          limit: z.number().min(1).max(20).optional().default(10),
        })
      ),
    },
    responses: {
      "200": {
        description: "Scan completed successfully",
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
            tweeted: z.boolean(),
            tweetResults: z.array(z.any()).optional(),
            timestamp: z.string(),
          }),
        }),
      },
    },
  };

  public async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const { min_confidence, tweet_results, limit } = data.body;

    // Get configuration
    const config: ScannerConfig = {
      minConfidenceScore: min_confidence,
      minVolumeThreshold: 1000000,
      sentimentSources: ["twitter", "reddit", "news"],
      sectors: ["Technology", "Healthcare", "Finance"],
      keywords: ["earnings", "merger", "FDA approval"],
    };

    // Run the scanner
    const scannerService = new StockScannerService();
    const picks = await scannerService.scanStocks(config);

    // Limit results
    const limitedPicks = picks.slice(0, limit);

    // Optionally tweet results
    let tweetResults: any[] = [];
    let tweeted = false;

    if (tweet_results && limitedPicks.length > 0) {
      const twitterService = new TwitterService();
      
      if (twitterService.isConfigured()) {
        tweetResults = await twitterService.tweetPicksThread(limitedPicks.slice(0, 5));
        tweeted = true;
      }
    }

    // TODO: Store picks in database
    // This would save the picks to the stock_picks table

    return {
      success: true,
      result: {
        picks: limitedPicks,
        count: limitedPicks.length,
        tweeted,
        tweetResults: tweeted ? tweetResults : undefined,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
