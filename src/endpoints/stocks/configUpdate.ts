import { OpenAPIRoute, contentJson } from "chanfana";
import { AppContext } from "../../types";
import { z } from "zod";

export class ConfigUpdateEndpoint extends OpenAPIRoute {
  public schema = {
    tags: ["Stocks"],
    summary: "Update scanner configuration",
    description: "Update scanner filters and preferences",
    operationId: "update-scanner-config",
    request: {
      body: contentJson(
        z.object({
          sentiment_sources: z.array(z.string()).optional(),
          sectors_filter: z.array(z.string()).optional(),
          min_confidence_score: z.number().min(0).max(1).optional(),
          min_volume_threshold: z.number().min(0).optional(),
          keywords: z.array(z.string()).optional(),
          tweet_enabled: z.boolean().optional(),
          premarket_scan_time: z.string().optional(),
        })
      ),
    },
    responses: {
      "200": {
        description: "Configuration updated successfully",
        ...contentJson({
          success: z.boolean(),
          result: z.object({
            updated: z.array(z.string()),
            message: z.string(),
          }),
        }),
      },
    },
  };

  public async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const db = c.env.DB;

    const updated: string[] = [];

    // Update each configuration value
    for (const [key, value] of Object.entries(data.body)) {
      if (value !== undefined) {
        // Serialize value as JSON
        const jsonValue = JSON.stringify(value);
        
        await db
          .prepare(
            `UPDATE scanner_config 
             SET config_value = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE config_key = ?`
          )
          .bind(jsonValue, key)
          .run();

        updated.push(key);
      }
    }

    return {
      success: true,
      result: {
        updated,
        message: `Updated ${updated.length} configuration setting(s)`,
      },
    };
  }
}
