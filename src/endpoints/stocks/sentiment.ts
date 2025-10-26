import { OpenAPIRoute, contentJson } from "chanfana";
import { AppContext } from "../../types";
import { z } from "zod";
import { SentimentAnalysisService } from "../../services/sentimentAnalysis";

export class SentimentEndpoint extends OpenAPIRoute {
  public schema = {
    tags: ["Stocks"],
    summary: "Get sentiment analysis for a stock",
    description: "Returns aggregated sentiment from multiple sources (social media, news, forums)",
    operationId: "get-stock-sentiment",
    request: {
      params: z.object({
        symbol: z.string().min(1).max(10).toUpperCase(),
      }),
    },
    responses: {
      "200": {
        description: "Sentiment data retrieved successfully",
        ...contentJson({
          success: z.boolean(),
          result: z.object({
            symbol: z.string(),
            overallScore: z.number(),
            sources: z.array(z.object({
              name: z.string(),
              score: z.number(),
              mentions: z.number(),
              keywords: z.array(z.string()),
            })),
            trending: z.boolean(),
            timestamp: z.string(),
          }),
        }),
      },
    },
  };

  public async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const { symbol } = data.params;

    const sentimentService = new SentimentAnalysisService();
    const sentiment = await sentimentService.analyzeSentiment(symbol);

    return {
      success: true,
      result: sentiment,
    };
  }
}
