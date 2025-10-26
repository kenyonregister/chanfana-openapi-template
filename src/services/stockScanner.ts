/**
 * Stock Scanner Service
 * 
 * Core scanning algorithm that combines sentiment analysis, market data,
 * earnings events, and other signals to generate stock picks with confidence scores.
 */

import { SentimentAnalysisService, SentimentAnalysis } from "./sentimentAnalysis";
import { MarketDataService, StockQuote } from "./marketData";

export interface StockPick {
  symbol: string;
  companyName: string;
  confidenceScore: number; // 0 to 1
  sentimentScore: number; // -1 to 1
  price: number;
  volume: number;
  priceChangePercent: number;
  reasoning: string[];
  dataSources: string[];
  isPremarket: boolean;
  pickDate: string;
}

export interface ScannerConfig {
  minConfidenceScore: number;
  minVolumeThreshold: number;
  sentimentSources: string[];
  sectors: string[];
  keywords: string[];
}

export class StockScannerService {
  private sentimentService: SentimentAnalysisService;
  private marketDataService: MarketDataService;

  constructor() {
    this.sentimentService = new SentimentAnalysisService();
    this.marketDataService = new MarketDataService();
  }

  /**
   * Run the main stock scanning algorithm
   * 
   * This combines multiple data sources to generate high-confidence stock picks:
   * 1. Get premarket movers
   * 2. Analyze sentiment for each
   * 3. Check for earnings/news events
   * 4. Calculate confidence scores
   * 5. Filter and rank results
   */
  async scanStocks(config: ScannerConfig): Promise<StockPick[]> {
    // Get premarket data
    const premarketData = await this.marketDataService.getPremarketData();
    
    // Combine all interesting stocks
    const candidateSymbols = new Set<string>();
    premarketData.topGainers.forEach(s => candidateSymbols.add(s.symbol));
    premarketData.topLosers.forEach(s => candidateSymbols.add(s.symbol));
    premarketData.volumeSpikes.forEach(s => candidateSymbols.add(s.symbol));
    
    // Get trending stocks from sentiment
    const trendingStocks = await this.sentimentService.getTrendingStocks();
    trendingStocks.forEach(s => candidateSymbols.add(s));
    
    const symbols = Array.from(candidateSymbols);
    
    // Analyze each candidate
    const picks: StockPick[] = [];
    
    for (const symbol of symbols) {
      try {
        const pick = await this.analyzeStock(symbol, config);
        
        // Filter by minimum confidence
        if (pick.confidenceScore >= config.minConfidenceScore) {
          picks.push(pick);
        }
      } catch (error) {
        console.error(`Error analyzing ${symbol}:`, error);
      }
    }
    
    // Sort by confidence score (highest first)
    picks.sort((a, b) => b.confidenceScore - a.confidenceScore);
    
    return picks;
  }

  /**
   * Analyze a single stock and generate a pick with confidence score
   */
  private async analyzeStock(
    symbol: string,
    config: ScannerConfig
  ): Promise<StockPick> {
    // Get market data
    const quote = await this.marketDataService.getQuote(symbol);
    
    // Get sentiment analysis
    const sentiment = await this.sentimentService.analyzeSentiment(symbol);
    
    // Calculate confidence score based on multiple factors
    const confidenceScore = this.calculateConfidenceScore(
      quote,
      sentiment,
      config
    );
    
    // Generate reasoning
    const reasoning = this.generateReasoning(quote, sentiment);
    
    // Determine data sources used
    const dataSources = [
      ...sentiment.sources.map(s => s.name),
      "market_data",
    ];
    
    return {
      symbol,
      companyName: quote.companyName || symbol,
      confidenceScore,
      sentimentScore: sentiment.overallScore,
      price: quote.price,
      volume: quote.volume,
      priceChangePercent: quote.changePercent,
      reasoning,
      dataSources,
      isPremarket: true,
      pickDate: new Date().toISOString(),
    };
  }

  /**
   * Calculate confidence score based on multiple signals
   * 
   * Factors considered:
   * - Sentiment score (positive sentiment increases confidence)
   * - Volume (high volume increases confidence)
   * - Price momentum (strong moves increase confidence)
   * - Trending status (social media buzz increases confidence)
   */
  private calculateConfidenceScore(
    quote: StockQuote,
    sentiment: SentimentAnalysis,
    config: ScannerConfig
  ): number {
    let score = 0;
    
    // Sentiment factor (0-30 points)
    // Positive sentiment increases confidence
    if (sentiment.overallScore > 0.3) {
      score += 30 * (sentiment.overallScore / 1.0);
    } else if (sentiment.overallScore > 0) {
      score += 15 * (sentiment.overallScore / 0.3);
    }
    
    // Volume factor (0-25 points)
    if (quote.volume > config.minVolumeThreshold * 2) {
      score += 25;
    } else if (quote.volume > config.minVolumeThreshold) {
      score += 15;
    }
    
    // Price momentum factor (0-25 points)
    const absChange = Math.abs(quote.changePercent);
    if (absChange > 10) {
      score += 25;
    } else if (absChange > 5) {
      score += 15;
    } else if (absChange > 2) {
      score += 10;
    }
    
    // Trending factor (0-20 points)
    if (sentiment.trending) {
      score += 20;
    }
    
    // Normalize to 0-1 range
    return Math.min(score / 100, 1.0);
  }

  /**
   * Generate human-readable reasoning for the pick
   */
  private generateReasoning(
    quote: StockQuote,
    sentiment: SentimentAnalysis
  ): string[] {
    const reasons: string[] = [];
    
    // Price movement
    if (Math.abs(quote.changePercent) > 5) {
      reasons.push(
        `Strong price movement: ${quote.changePercent > 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%`
      );
    }
    
    // Volume
    if (quote.volume > 5000000) {
      reasons.push(`High volume: ${(quote.volume / 1000000).toFixed(1)}M shares`);
    }
    
    // Sentiment
    if (sentiment.overallScore > 0.5) {
      reasons.push(`Very positive sentiment (${(sentiment.overallScore * 100).toFixed(0)}%)`);
    } else if (sentiment.overallScore > 0.2) {
      reasons.push(`Positive sentiment (${(sentiment.overallScore * 100).toFixed(0)}%)`);
    }
    
    // Trending
    if (sentiment.trending) {
      reasons.push("Trending on social media");
    }
    
    // Keywords
    const allKeywords = sentiment.sources.flatMap(s => s.keywords);
    const uniqueKeywords = [...new Set(allKeywords)];
    if (uniqueKeywords.length > 0) {
      reasons.push(`Key topics: ${uniqueKeywords.slice(0, 3).join(", ")}`);
    }
    
    return reasons;
  }

  /**
   * Backtest the algorithm on historical data
   * 
   * This would validate the algorithm's performance over past data
   */
  async backtest(
    startDate: Date,
    endDate: Date,
    config: ScannerConfig
  ): Promise<any> {
    // TODO: Implement backtesting logic
    // This would:
    // 1. Get historical picks for the date range
    // 2. Compare predictions to actual outcomes
    // 3. Calculate accuracy, returns, win rate, etc.
    
    return {
      message: "Backtesting not yet implemented",
      note: "This would analyze historical performance of the algorithm",
    };
  }
}
