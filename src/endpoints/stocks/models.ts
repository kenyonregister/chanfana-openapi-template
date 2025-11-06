import { z } from "zod";

// Stock Pick Schema
export const stockPick = z.object({
  id: z.number().int().optional(),
  symbol: z.string().min(1).max(10),
  company_name: z.string().optional(),
  pick_date: z.string().datetime(),
  confidence_score: z.number().min(0).max(1),
  sentiment_score: z.number().min(-1).max(1).optional(),
  price: z.number().optional(),
  volume: z.number().optional(),
  price_change_percent: z.number().optional(),
  reasoning: z.string().optional(),
  data_sources: z.string().optional(),
  is_premarket: z.number().optional(),
  was_tweeted: z.number().optional(),
  created_at: z.string().datetime().optional(),
});

export const StockPickModel = {
  tableName: "stock_picks",
  primaryKeys: ["id"],
  schema: stockPick,
  serializer: (obj: Record<string, any>) => obj,
  serializerObject: stockPick,
};

// Sentiment Data Schema
export const sentimentData = z.object({
  id: z.number().int().optional(),
  symbol: z.string().min(1).max(10),
  source: z.string(),
  sentiment_score: z.number().min(-1).max(1),
  mention_count: z.number().optional(),
  data_date: z.string().datetime(),
  keywords: z.string().optional(),
  raw_data: z.string().optional(),
  created_at: z.string().datetime().optional(),
});

export const SentimentDataModel = {
  tableName: "sentiment_data",
  primaryKeys: ["id"],
  schema: sentimentData,
  serializer: (obj: Record<string, any>) => obj,
  serializerObject: sentimentData,
};

// Earnings Calendar Schema
export const earningsCalendar = z.object({
  id: z.number().int().optional(),
  symbol: z.string().min(1).max(10),
  company_name: z.string().optional(),
  earnings_date: z.string().datetime(),
  estimate_eps: z.number().optional(),
  actual_eps: z.number().optional(),
  surprise_percent: z.number().optional(),
  time_of_day: z.enum(["BMO", "AMC"]).optional(),
  is_confirmed: z.number().optional(),
  alert_sent: z.number().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const EarningsCalendarModel = {
  tableName: "earnings_calendar",
  primaryKeys: ["id"],
  schema: earningsCalendar,
  serializer: (obj: Record<string, any>) => obj,
  serializerObject: earningsCalendar,
};

// Scanner Config Schema
export const scannerConfig = z.object({
  id: z.number().int().optional(),
  config_key: z.string(),
  config_value: z.string(),
  description: z.string().optional(),
  updated_at: z.string().datetime().optional(),
});

export const ScannerConfigModel = {
  tableName: "scanner_config",
  primaryKeys: ["id"],
  schema: scannerConfig,
  serializer: (obj: Record<string, any>) => obj,
  serializerObject: scannerConfig,
};

