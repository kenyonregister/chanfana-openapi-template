import { OpenAPIRoute, contentJson } from "chanfana";
import { AppContext } from "../../types";
import { z } from "zod";

export class ConfigGetEndpoint extends OpenAPIRoute {
  public schema = {
    tags: ["Stocks"],
    summary: "Get scanner configuration",
    description: "Returns the current scanner configuration including filters and preferences",
    operationId: "get-scanner-config",
    responses: {
      "200": {
        description: "Configuration retrieved successfully",
        ...contentJson({
          success: z.boolean(),
          result: z.object({
            sentiment_sources: z.array(z.string()),
            sectors_filter: z.array(z.string()),
            min_confidence_score: z.number(),
            min_volume_threshold: z.number(),
            keywords: z.array(z.string()),
            tweet_enabled: z.boolean(),
            premarket_scan_time: z.string(),
          }),
        }),
      },
    },
  };

  public async handle(c: AppContext) {
    const db = c.env.DB;

    // Fetch all configuration from database
    const configs = await db
      .prepare("SELECT config_key, config_value FROM scanner_config")
      .all();

    // Parse configuration values
    const result: any = {};
    
    for (const row of configs.results) {
      const key = row.config_key as string;
      const value = row.config_value as string;
      
      try {
        // Try to parse as JSON first
        result[key] = JSON.parse(value);
      } catch {
        // If not JSON, store as string
        result[key] = value;
      }
    }

    return {
      success: true,
      result,
    };
  }
}
