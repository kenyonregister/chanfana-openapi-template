/**
 * Twitter/X Integration Service
 * 
 * Handles posting stock picks and premarket summaries to Twitter/X.
 * In production, this would use the Twitter API v2 with OAuth 2.0.
 */

import { StockPick } from "./stockScanner";
import { PremarketData } from "./marketData";

export interface TweetResult {
  success: boolean;
  tweetId?: string;
  error?: string;
  message: string;
}

export class TwitterService {
  private readonly maxTweetLength = 280;
  private readonly apiKey?: string;
  private readonly apiSecret?: string;
  private readonly accessToken?: string;
  private readonly accessTokenSecret?: string;

  constructor() {
    // TODO: Load credentials from environment variables
    // For now, this is a mock implementation
    this.apiKey = process.env.TWITTER_API_KEY;
    this.apiSecret = process.env.TWITTER_API_SECRET;
    this.accessToken = process.env.TWITTER_ACCESS_TOKEN;
    this.accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
  }

  /**
   * Tweet a stock pick with formatting
   */
  async tweetStockPick(pick: StockPick): Promise<TweetResult> {
    const tweet = this.formatStockPickTweet(pick);
    return this.sendTweet(tweet);
  }

  /**
   * Tweet premarket summary
   */
  async tweetPremarketSummary(data: PremarketData): Promise<TweetResult> {
    const tweet = this.formatPremarketSummary(data);
    return this.sendTweet(tweet);
  }

  /**
   * Tweet multiple picks as a thread
   */
  async tweetPicksThread(picks: StockPick[]): Promise<TweetResult[]> {
    const results: TweetResult[] = [];
    
    // First tweet: introduction
    const intro = this.formatThreadIntro(picks.length);
    const introResult = await this.sendTweet(intro);
    results.push(introResult);
    
    // Subsequent tweets: individual picks
    for (const pick of picks.slice(0, 5)) { // Limit to top 5
      const tweet = this.formatStockPickTweet(pick);
      const result = await this.sendTweet(tweet);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Format a stock pick as a tweet
   */
  private formatStockPickTweet(pick: StockPick): string {
    const emoji = pick.priceChangePercent > 0 ? "🚀" : "📉";
    const sentiment = pick.sentimentScore > 0.5 ? "🔥" : pick.sentimentScore > 0 ? "📈" : "⚠️";
    
    const lines = [
      `${emoji} $${pick.symbol} - ${pick.companyName}`,
      ``,
      `📊 Price: $${pick.price.toFixed(2)} (${pick.priceChangePercent > 0 ? '+' : ''}${pick.priceChangePercent.toFixed(2)}%)`,
      `${sentiment} Confidence: ${(pick.confidenceScore * 100).toFixed(0)}%`,
      `💭 Sentiment: ${(pick.sentimentScore * 100).toFixed(0)}%`,
      ``,
      `📝 ${pick.reasoning[0] || 'Strong signals detected'}`,
    ];
    
    let tweet = lines.join('\n');
    
    // Truncate if too long
    if (tweet.length > this.maxTweetLength) {
      tweet = tweet.substring(0, this.maxTweetLength - 3) + '...';
    }
    
    return tweet;
  }

  /**
   * Format premarket summary as a tweet
   */
  private formatPremarketSummary(data: PremarketData): string {
    const topGainer = data.topGainers[0];
    const topLoser = data.topLosers[0];
    
    const lines = [
      `🌅 PREMARKET SUMMARY`,
      ``,
      `🚀 Top Gainer: $${topGainer?.symbol} +${topGainer?.changePercent.toFixed(2)}%`,
      `📉 Top Loser: $${topLoser?.symbol} ${topLoser?.changePercent.toFixed(2)}%`,
      ``,
      `📊 ${data.volumeSpikes.length} stocks showing unusual volume`,
      ``,
      `#StockMarket #Premarket #Trading`,
    ];
    
    return lines.join('\n');
  }

  /**
   * Format thread introduction
   */
  private formatThreadIntro(pickCount: number): string {
    return [
      `🎯 Today's Top Stock Picks`,
      ``,
      `Our AI scanner identified ${pickCount} high-confidence opportunities`,
      ``,
      `🧵 Thread below 👇`,
      ``,
      `#StockPicks #Trading #Investing`,
    ].join('\n');
  }

  /**
   * Send tweet to Twitter API
   * 
   * In production, this would use the Twitter API v2
   */
  private async sendTweet(text: string): Promise<TweetResult> {
    // TODO: Implement real Twitter API integration
    // For now, return mock success
    
    if (!this.apiKey) {
      return {
        success: false,
        error: "Twitter API credentials not configured",
        message: "Tweet not sent - API not configured",
      };
    }
    
    // Mock implementation - in production, this would call Twitter API
    console.log("Would tweet:", text);
    
    return {
      success: true,
      tweetId: `mock_${Date.now()}`,
      message: "Tweet sent successfully (mock)",
    };
  }

  /**
   * Check if Twitter integration is configured
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.apiSecret && this.accessToken && this.accessTokenSecret);
  }
}
