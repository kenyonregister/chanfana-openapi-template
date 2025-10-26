# Stock Scanner API with OpenAPI

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/chanfana-openapi-template)

![OpenAPI Template Preview](https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/91076b39-1f5b-46f6-7f14-536a6f183000/public)

<!-- dash-content-start -->

This is a Cloudflare Worker with OpenAPI 3.1 Auto Generation and Validation using [chanfana](https://github.com/cloudflare/chanfana) and [Hono](https://github.com/honojs/hono).

## Features

### 🎯 AI-Powered Stock Scanner
- **Sentiment Analysis**: Aggregates data from multiple sources (Twitter/X, Reddit, news) to gauge market sentiment
- **Premarket Data**: Real-time top gainers, losers, and volume spikes
- **Stock Picks**: AI-generated stock picks with confidence scores based on sentiment, momentum, and volume
- **Earnings Calendar**: Track upcoming earnings events with estimates and actuals
- **Social Integration**: Automated tweet formatting for stock picks and premarket summaries

### 🔧 Technical Stack
- OpenAPI 3.1 compliant API with automatic schema generation
- Cloudflare Workers for serverless edge computing
- D1 Database for persistent storage
- Comprehensive integration tests using Vitest

This template includes various endpoints, a D1 database, and integration tests using [Vitest](https://vitest.dev/) as examples. In endpoints, you will find [chanfana D1 AutoEndpoints](https://chanfana.com/endpoints/auto/d1) and a [normal endpoint](https://chanfana.com/endpoints/defining-endpoints) to serve as examples for your projects.

Besides being able to see the OpenAPI schema (openapi.json) in the browser, you can also extract the schema locally no hassle by running this command `npm run schema`.

<!-- dash-content-end -->

> [!IMPORTANT]
> When using C3 to create this project, select "no" when it asks if you want to deploy. You need to follow this project's [setup steps](#setup-steps) before deploying.

## Getting Started

Outside of this repo, you can start a new project with this template using [C3](https://developers.cloudflare.com/pages/get-started/c3/) (the `create-cloudflare` CLI):

```bash
npm create cloudflare@latest -- --template=cloudflare/templates/openapi-template
```

A live public deployment of this template is available at [https://openapi-template.templates.workers.dev](https://openapi-template.templates.workers.dev)

## Setup Steps

1. Install the project dependencies with a package manager of your choice:
   ```bash
   npm install
   ```

2. Create a [D1 database](https://developers.cloudflare.com/d1/get-started/) with the name "openapi-template-db":
   ```bash
   npx wrangler d1 create openapi-template-db
   ```
   ...and update the `database_id` field in `wrangler.jsonc` with the new database ID.

3. Run the database migrations to initialize the database (notice the `migrations` directory in this project):
   ```bash
   npx wrangler d1 migrations apply DB --local   # For local development
   npx wrangler d1 migrations apply DB --remote  # For production
   ```

4. **(Optional)** Configure Twitter/X API credentials for social posting:
   Add the following environment variables to your Cloudflare Worker:
   - `TWITTER_API_KEY`
   - `TWITTER_API_SECRET`
   - `TWITTER_ACCESS_TOKEN`
   - `TWITTER_ACCESS_TOKEN_SECRET`

5. Deploy the project!
   ```bash
   npx wrangler deploy
   ```

6. Monitor your worker:
   ```bash
   npx wrangler tail
   ```

## API Endpoints

### Stock Scanner Endpoints

#### `GET /stocks/premarket`
Get premarket top movers, losers, and volume spikes.

**Response:**
```json
{
  "success": true,
  "result": {
    "topGainers": [...],
    "topLosers": [...],
    "volumeSpikes": [...],
    "timestamp": "2025-10-26T03:00:00Z"
  }
}
```

#### `GET /stocks/picks`
Get AI-generated stock picks based on sentiment and market data.

**Query Parameters:**
- `min_confidence` (optional): Minimum confidence score (0-1), default: 0.6
- `limit` (optional): Maximum number of picks to return, default: 10

**Response:**
```json
{
  "success": true,
  "result": {
    "picks": [
      {
        "symbol": "AAPL",
        "companyName": "Apple Inc.",
        "confidenceScore": 0.85,
        "sentimentScore": 0.7,
        "price": 185.50,
        "volume": 45000000,
        "priceChangePercent": 2.5,
        "reasoning": [
          "Strong price movement: +2.5%",
          "High volume: 45.0M shares",
          "Very positive sentiment (70%)"
        ],
        "dataSources": ["twitter", "reddit", "news", "market_data"],
        "isPremarket": true,
        "pickDate": "2025-10-26T07:00:00Z"
      }
    ],
    "count": 1,
    "timestamp": "2025-10-26T07:00:00Z"
  }
}
```

#### `GET /stocks/sentiment/:symbol`
Get aggregated sentiment analysis for a specific stock.

**Parameters:**
- `symbol`: Stock ticker symbol (e.g., AAPL, TSLA)

**Response:**
```json
{
  "success": true,
  "result": {
    "symbol": "AAPL",
    "overallScore": 0.65,
    "sources": [
      {
        "name": "twitter",
        "score": 0.7,
        "mentions": 850,
        "keywords": ["bullish", "earnings", "breakout"]
      }
    ],
    "trending": true,
    "timestamp": "2025-10-26T07:00:00Z"
  }
}
```

#### `POST /stocks/scan`
Manually trigger a stock scan.

**Request Body:**
```json
{
  "min_confidence": 0.6,
  "tweet_results": false,
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "picks": [...],
    "count": 5,
    "tweeted": false,
    "timestamp": "2025-10-26T07:00:00Z"
  }
}
```

#### `GET /stocks/earnings`
Get earnings calendar with upcoming and past earnings events.

Supports standard D1 query parameters: `search`, `orderBy`, `page`, `perPage`

#### `GET /stocks/config`
Get current scanner configuration.

**Response:**
```json
{
  "success": true,
  "result": {
    "sentiment_sources": ["twitter", "reddit", "news"],
    "sectors_filter": ["Technology", "Healthcare", "Finance"],
    "min_confidence_score": 0.6,
    "min_volume_threshold": 1000000,
    "keywords": ["earnings", "merger", "FDA approval"],
    "tweet_enabled": true,
    "premarket_scan_time": "07:00"
  }
}
```

#### `PUT /stocks/config`
Update scanner configuration.

**Request Body:**
```json
{
  "min_confidence_score": 0.7,
  "tweet_enabled": false,
  "keywords": ["earnings", "buyout", "breakthrough"]
}
```

### Task Management Endpoints

Standard CRUD endpoints for task management (example endpoints):
- `GET /tasks` - List all tasks
- `POST /tasks` - Create a new task
- `GET /tasks/:id` - Get a specific task
- `PUT /tasks/:id` - Update a task
- `DELETE /tasks/:id` - Delete a task

## Testing

This template includes comprehensive integration tests using [Vitest](https://vitest.dev/). To run the tests locally:

```bash
npm run test
```

Test files are located in the `tests/` directory, with examples demonstrating how to test your endpoints and database interactions.

## Project Structure

```
├── src/
│   ├── endpoints/
│   │   ├── stocks/          # Stock scanner endpoints
│   │   │   ├── configGet.ts
│   │   │   ├── configUpdate.ts
│   │   │   ├── earnings.ts
│   │   │   ├── models.ts
│   │   │   ├── picks.ts
│   │   │   ├── premarket.ts
│   │   │   ├── router.ts
│   │   │   ├── scan.ts
│   │   │   └── sentiment.ts
│   │   ├── tasks/           # Example task endpoints
│   │   └── dummyEndpoint.ts
│   ├── services/            # Business logic layer
│   │   ├── marketData.ts    # Market data aggregation
│   │   ├── sentimentAnalysis.ts  # Sentiment analysis
│   │   ├── stockScanner.ts  # Main scanning algorithm
│   │   └── twitter.ts       # Twitter/X integration
│   ├── index.ts            # Main router
│   └── types.ts            # TypeScript types
├── tests/
│   └── integration/        # Integration tests
├── migrations/             # Database migrations
│   ├── 0001_add_tasks_table.sql
│   └── 0002_add_stock_scanner_tables.sql
└── wrangler.jsonc         # Cloudflare Worker configuration
```

## Architecture

### Services Layer

The application follows a service-oriented architecture:

1. **SentimentAnalysisService**: Aggregates sentiment from multiple sources
2. **MarketDataService**: Fetches premarket data and stock quotes
3. **StockScannerService**: Core algorithm that combines signals to generate picks
4. **TwitterService**: Formats and posts stock picks to Twitter/X

### Database Schema

The stock scanner uses the following tables:

- `stock_picks`: Stores generated stock picks with confidence scores
- `sentiment_data`: Aggregated sentiment data from various sources
- `earnings_calendar`: Upcoming and past earnings events
- `scanner_config`: User configuration and preferences

### Data Flow

1. Scanner triggers (manual or scheduled)
2. Fetch premarket data and trending stocks
3. Analyze sentiment for each candidate
4. Calculate confidence scores based on multiple signals
5. Filter and rank picks
6. Store in database
7. Optionally tweet results

## Integration with External APIs

The stock scanner is designed to integrate with real market data and social media APIs. To use in production:

### Market Data APIs
- [Alpha Vantage](https://www.alphavantage.co/)
- [Polygon.io](https://polygon.io/)
- [IEX Cloud](https://iexcloud.io/)
- [Yahoo Finance API](https://www.yahoofinanceapi.com/)

Update the `MarketDataService` in `src/services/marketData.ts` to use your chosen provider.

### Social Media APIs
- [Twitter/X API v2](https://developer.twitter.com/en/docs/twitter-api)
- [Reddit API](https://www.reddit.com/dev/api/)

Update the `SentimentAnalysisService` and `TwitterService` with your API credentials.

### News APIs
- [NewsAPI](https://newsapi.org/)
- [Benzinga](https://www.benzinga.com/apis)
- [Alpha Vantage News](https://www.alphavantage.co/documentation/#news-sentiment)

## Development

### Local Development

```bash
npm run dev
```

### Type Generation

```bash
npm run cf-typegen
```

### Extract OpenAPI Schema

```bash
npm run schema
```

### Deploy

```bash
npm run deploy
```

## Environment Variables

Configure the following environment variables in your Cloudflare Worker:

```bash
# Twitter/X API (optional, for social posting)
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret

# Market Data API (add your provider's credentials)
MARKET_DATA_API_KEY=your_market_data_key
```

## Future Enhancements

- [ ] Real-time WebSocket support for live stock updates
- [ ] Advanced backtesting with historical performance metrics
- [ ] Machine learning model integration for improved predictions
- [ ] Multi-timeframe analysis (1min, 5min, 1hr, 1day)
- [ ] Custom alert system via email/SMS
- [ ] Portfolio tracking and performance analytics
- [ ] Integration with brokerage APIs for automated trading

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Resources

- [chanfana Documentation](https://chanfana.com/)
- [Hono Documentation](https://hono.dev/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Vitest Documentation](https://vitest.dev/guide/)

## License

MIT
