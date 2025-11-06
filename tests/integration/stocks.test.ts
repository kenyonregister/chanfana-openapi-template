import { SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";

describe("Stock Scanner Endpoints", () => {
  describe("GET /stocks/premarket", () => {
    it("should return premarket data", async () => {
      const res = await SELF.fetch("http://local.test/stocks/premarket");
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.result).toBeDefined();
      expect(data.result.topGainers).toBeDefined();
      expect(data.result.topLosers).toBeDefined();
      expect(data.result.volumeSpikes).toBeDefined();
      expect(Array.isArray(data.result.topGainers)).toBe(true);
    });
  });

  describe("GET /stocks/intraday", () => {
    it("should return intraday runners data", async () => {
      const res = await SELF.fetch("http://local.test/stocks/intraday");
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.result).toBeDefined();
      expect(data.result.topRunners).toBeDefined();
      expect(data.result.breakoutStocks).toBeDefined();
      expect(data.result.volumeLeaders).toBeDefined();
      expect(Array.isArray(data.result.topRunners)).toBe(true);
    });

    it("should return stocks with positive momentum", async () => {
      const res = await SELF.fetch("http://local.test/stocks/intraday");
      expect(res.status).toBe(200);
      
      const data = await res.json();
      // Intraday runners should have positive price changes
      data.result.topRunners.forEach((stock: any) => {
        expect(stock.changePercent).toBeGreaterThan(0);
      });
    });
  });

  describe("GET /stocks/picks", () => {
    it("should return stock picks", async () => {
      const res = await SELF.fetch("http://local.test/stocks/picks");
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.result).toBeDefined();
      expect(data.result.picks).toBeDefined();
      expect(Array.isArray(data.result.picks)).toBe(true);
      expect(data.result.count).toBeGreaterThanOrEqual(0);
    });

    it("should include intraday stocks by default", async () => {
      const res = await SELF.fetch("http://local.test/stocks/picks");
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      // Should have picks from both premarket and intraday
      expect(data.result.picks.length).toBeGreaterThan(0);
    });

    it("should respect min_confidence parameter", async () => {
      const res = await SELF.fetch("http://local.test/stocks/picks?min_confidence=0.8");
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      
      // All picks should have confidence >= 0.8
      data.result.picks.forEach((pick: any) => {
        expect(pick.confidenceScore).toBeGreaterThanOrEqual(0.8);
      });
    });

    it("should respect limit parameter", async () => {
      const res = await SELF.fetch("http://local.test/stocks/picks?limit=3");
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.result.picks.length).toBeLessThanOrEqual(3);
    });
  });

  describe("GET /stocks/sentiment/:symbol", () => {
    it("should return sentiment for a stock", async () => {
      const res = await SELF.fetch("http://local.test/stocks/sentiment/AAPL");
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.result).toBeDefined();
      expect(data.result.symbol).toBe("AAPL");
      expect(data.result.overallScore).toBeDefined();
      expect(data.result.sources).toBeDefined();
      expect(Array.isArray(data.result.sources)).toBe(true);
    });

    it("should have sentiment scores in valid range", async () => {
      const res = await SELF.fetch("http://local.test/stocks/sentiment/TSLA");
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.result.overallScore).toBeGreaterThanOrEqual(-1);
      expect(data.result.overallScore).toBeLessThanOrEqual(1);
      
      data.result.sources.forEach((source: any) => {
        expect(source.score).toBeGreaterThanOrEqual(-1);
        expect(source.score).toBeLessThanOrEqual(1);
      });
    });
  });

  describe("POST /stocks/scan", () => {
    it("should trigger a stock scan", async () => {
      const res = await SELF.fetch("http://local.test/stocks/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          min_confidence: 0.5,
          tweet_results: false,
          limit: 5,
        }),
      });
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.result.picks).toBeDefined();
      expect(data.result.count).toBeGreaterThanOrEqual(0);
      expect(data.result.tweeted).toBe(false);
    });

    it("should return picks with required fields", async () => {
      const res = await SELF.fetch("http://local.test/stocks/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          min_confidence: 0.6,
          limit: 10,
        }),
      });
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      data.result.picks.forEach((pick: any) => {
        expect(pick.symbol).toBeDefined();
        expect(pick.confidenceScore).toBeDefined();
        expect(pick.reasoning).toBeDefined();
        expect(Array.isArray(pick.reasoning)).toBe(true);
        expect(pick.dataSources).toBeDefined();
        expect(Array.isArray(pick.dataSources)).toBe(true);
      });
    });
  });

  describe("GET /stocks/config", () => {
    it("should return scanner configuration", async () => {
      const res = await SELF.fetch("http://local.test/stocks/config");
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.result).toBeDefined();
    });
  });

  describe("PUT /stocks/config", () => {
    it("should update scanner configuration", async () => {
      const res = await SELF.fetch("http://local.test/stocks/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          min_confidence_score: 0.7,
          tweet_enabled: false,
        }),
      });
      
      expect(res.status).toBe(200);
      
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.result.updated).toBeDefined();
      expect(Array.isArray(data.result.updated)).toBe(true);
    });
  });
});
