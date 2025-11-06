/**
 * Market Data Service
 * 
 * This service handles fetching and processing market data including:
 * - Premarket data (top gainers/losers, volume spikes)
 * - Real-time quotes
 * - Historical data for backtesting
 * 
 * In production, this would integrate with market data APIs like:
 * - Alpha Vantage, Polygon.io, IEX Cloud, Yahoo Finance, etc.
 */

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  companyName?: string;
}

export interface PremarketData {
  topGainers: StockQuote[];
  topLosers: StockQuote[];
  volumeSpikes: StockQuote[];
  timestamp: string;
}

export interface IntradayData {
  topRunners: StockQuote[];
  breakoutStocks: StockQuote[];
  volumeLeaders: StockQuote[];
  timestamp: string;
}

export class MarketDataService {
  /**
   * Get premarket top movers
   * 
   * In production, this would fetch real premarket data from market data APIs
   */
  async getPremarketData(): Promise<PremarketData> {
    // TODO: Integrate with real market data API
    
    return {
      topGainers: this.generateMockStocks(5, true),
      topLosers: this.generateMockStocks(5, false),
      volumeSpikes: this.generateMockStocks(5, true),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get intraday runners - stocks making significant moves during trading hours
   * 
   * Captures momentum stocks with:
   * - Strong intraday price movements (runners)
   * - Technical breakouts above resistance
   * - Unusual volume spikes during the day
   * 
   * In production, this would fetch real-time intraday data from market data APIs
   */
  async getIntradayData(): Promise<IntradayData> {
    // TODO: Integrate with real market data API for intraday scanning
    
    return {
      topRunners: this.generateIntradayRunners(5),
      breakoutStocks: this.generateBreakoutStocks(5),
      volumeLeaders: this.generateVolumeLeaders(5),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get quote for a single stock
   */
  async getQuote(symbol: string): Promise<StockQuote> {
    // TODO: Integrate with real market data API
    
    return {
      symbol,
      price: Math.random() * 500 + 10,
      change: (Math.random() * 20 - 10),
      changePercent: (Math.random() * 10 - 5),
      volume: Math.floor(Math.random() * 10000000) + 100000,
      companyName: `${symbol} Inc.`,
    };
  }

  /**
   * Get quotes for multiple stocks
   */
  async getQuotes(symbols: string[]): Promise<StockQuote[]> {
    return Promise.all(symbols.map(symbol => this.getQuote(symbol)));
  }

  /**
   * Detect unusual volume activity
   * 
   * In production, this would compare current volume to average volume
   */
  async detectVolumeSpikes(symbols: string[]): Promise<StockQuote[]> {
    // TODO: Implement real volume spike detection
    const quotes = await this.getQuotes(symbols);
    
    // Filter for high volume (simplified)
    return quotes.filter(q => q.volume > 5000000);
  }

  /**
   * Get historical data for backtesting
   * 
   * @param symbol Stock ticker
   * @param startDate Start date for historical data
   * @param endDate End date for historical data
   */
  async getHistoricalData(
    symbol: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    // TODO: Implement real historical data fetching
    // This would be used for backtesting the algorithm
    
    return [];
  }

  /**
   * Generate mock stock data for testing
   */
  private generateMockStocks(count: number, isGainer: boolean): StockQuote[] {
    const symbols = [
      "AAPL", "TSLA", "NVDA", "AMD", "MSFT", "GOOGL", "AMZN", 
      "META", "NFLX", "SPY", "QQQ", "DIS", "BA", "GE", "F"
    ];
    
    const results: StockQuote[] = [];
    const shuffled = [...symbols].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < count && i < shuffled.length; i++) {
      const symbol = shuffled[i];
      const baseChange = isGainer ? 
        (Math.random() * 15 + 2) : 
        -(Math.random() * 15 + 2);
      
      results.push({
        symbol,
        price: Math.random() * 500 + 10,
        change: baseChange,
        changePercent: baseChange / 10,
        volume: Math.floor(Math.random() * 10000000) + 1000000,
        companyName: `${symbol} Inc.`,
      });
    }
    
    return results;
  }

  /**
   * Generate mock intraday runners - stocks with strong momentum
   */
  private generateIntradayRunners(count: number): StockQuote[] {
    const symbols = [
      "TSLA", "NVDA", "AMD", "PLTR", "COIN", "HOOD", "RIOT", 
      "MARA", "MSTR", "SOFI", "LCID", "RIVN", "NIO", "PLUG"
    ];
    
    const results: StockQuote[] = [];
    const shuffled = [...symbols].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < count && i < shuffled.length; i++) {
      const symbol = shuffled[i];
      // Intraday runners typically show 5-20% gains
      const changePercent = Math.random() * 15 + 5;
      
      results.push({
        symbol,
        price: Math.random() * 300 + 20,
        change: changePercent,
        changePercent: changePercent,
        volume: Math.floor(Math.random() * 20000000) + 5000000,
        companyName: `${symbol} Inc.`,
      });
    }
    
    return results;
  }

  /**
   * Generate mock breakout stocks - stocks breaking technical resistance
   */
  private generateBreakoutStocks(count: number): StockQuote[] {
    const symbols = [
      "AAPL", "MSFT", "GOOGL", "AMZN", "META", "NFLX", 
      "CRM", "ADBE", "ORCL", "INTC", "CSCO", "QCOM"
    ];
    
    const results: StockQuote[] = [];
    const shuffled = [...symbols].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < count && i < shuffled.length; i++) {
      const symbol = shuffled[i];
      // Breakouts typically show 3-8% moves
      const changePercent = Math.random() * 5 + 3;
      
      results.push({
        symbol,
        price: Math.random() * 400 + 50,
        change: changePercent,
        changePercent: changePercent,
        volume: Math.floor(Math.random() * 15000000) + 3000000,
        companyName: `${symbol} Inc.`,
      });
    }
    
    return results;
  }

  /**
   * Generate mock volume leaders - stocks with unusual volume
   */
  private generateVolumeLeaders(count: number): StockQuote[] {
    const symbols = [
      "SPY", "QQQ", "AAPL", "TSLA", "NVDA", "AMD", "SOXL",
      "TQQQ", "SQQQ", "SPXL", "UDOW", "TNA"
    ];
    
    const results: StockQuote[] = [];
    const shuffled = [...symbols].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < count && i < shuffled.length; i++) {
      const symbol = shuffled[i];
      const changePercent = Math.random() * 8 - 2;
      
      results.push({
        symbol,
        price: Math.random() * 450 + 30,
        change: changePercent,
        changePercent: changePercent,
        // Volume leaders have exceptional volume
        volume: Math.floor(Math.random() * 50000000) + 20000000,
        companyName: `${symbol} Inc.`,
      });
    }
    
    return results;
  }
}
