import { Hono } from "hono";
import { fromHono } from "chanfana";
import { PremarketEndpoint } from "./premarket";
import { StockPicksEndpoint } from "./picks";
import { SentimentEndpoint } from "./sentiment";
import { ScanEndpoint } from "./scan";
import { EarningsCalendarEndpoint } from "./earnings";
import { ConfigGetEndpoint } from "./configGet";
import { ConfigUpdateEndpoint } from "./configUpdate";

export const stocksRouter = fromHono(new Hono());

// Market data endpoints
stocksRouter.get("/premarket", PremarketEndpoint);

// Stock picks and sentiment
stocksRouter.get("/picks", StockPicksEndpoint);
stocksRouter.get("/sentiment/:symbol", SentimentEndpoint);
stocksRouter.post("/scan", ScanEndpoint);

// Earnings calendar
stocksRouter.get("/earnings", EarningsCalendarEndpoint);

// Configuration
stocksRouter.get("/config", ConfigGetEndpoint);
stocksRouter.put("/config", ConfigUpdateEndpoint);
