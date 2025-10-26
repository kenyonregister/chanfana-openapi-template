-- Migration number: 0002 	 2025-10-26T03:18:00.000Z

-- Stock picks table - stores generated stock picks with confidence scores
CREATE TABLE IF NOT EXISTS stock_picks (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    symbol TEXT NOT NULL,
    company_name TEXT,
    pick_date DATETIME NOT NULL,
    confidence_score REAL NOT NULL,
    sentiment_score REAL,
    price REAL,
    volume INTEGER,
    price_change_percent REAL,
    reasoning TEXT,
    data_sources TEXT, -- JSON array of sources
    is_premarket INTEGER DEFAULT 1,
    was_tweeted INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sentiment data table - stores aggregated sentiment from various sources
CREATE TABLE IF NOT EXISTS sentiment_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    symbol TEXT NOT NULL,
    source TEXT NOT NULL, -- 'twitter', 'news', 'reddit', etc.
    sentiment_score REAL NOT NULL, -- -1.0 to 1.0
    mention_count INTEGER,
    data_date DATETIME NOT NULL,
    keywords TEXT, -- JSON array of trending keywords
    raw_data TEXT, -- JSON object with raw sentiment data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Earnings calendar table - stores upcoming and past earnings events
CREATE TABLE IF NOT EXISTS earnings_calendar (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    symbol TEXT NOT NULL,
    company_name TEXT,
    earnings_date DATETIME NOT NULL,
    estimate_eps REAL,
    actual_eps REAL,
    surprise_percent REAL,
    time_of_day TEXT, -- 'BMO' (before market open), 'AMC' (after market close)
    is_confirmed INTEGER DEFAULT 0,
    alert_sent INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User configuration table - stores scanner filters and preferences
CREATE TABLE IF NOT EXISTS scanner_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    config_key TEXT NOT NULL UNIQUE,
    config_value TEXT NOT NULL, -- JSON object
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default configuration
INSERT OR IGNORE INTO scanner_config (config_key, config_value, description) VALUES 
('sentiment_sources', '["twitter", "reddit", "news"]', 'Active sentiment analysis sources'),
('sectors_filter', '["Technology", "Healthcare", "Finance", "Energy", "Consumer"]', 'Sectors to monitor'),
('min_confidence_score', '0.6', 'Minimum confidence score for stock picks'),
('min_volume_threshold', '1000000', 'Minimum daily volume threshold'),
('keywords', '["earnings", "buyout", "merger", "FDA approval", "breakthrough"]', 'Keywords to monitor'),
('tweet_enabled', 'true', 'Enable automated tweeting'),
('premarket_scan_time', '07:00', 'Time to run premarket scan (UTC)');

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stock_picks_symbol ON stock_picks(symbol);
CREATE INDEX IF NOT EXISTS idx_stock_picks_date ON stock_picks(pick_date);
CREATE INDEX IF NOT EXISTS idx_sentiment_data_symbol ON sentiment_data(symbol);
CREATE INDEX IF NOT EXISTS idx_sentiment_data_date ON sentiment_data(data_date);
CREATE INDEX IF NOT EXISTS idx_earnings_calendar_symbol ON earnings_calendar(symbol);
CREATE INDEX IF NOT EXISTS idx_earnings_calendar_date ON earnings_calendar(earnings_date);
