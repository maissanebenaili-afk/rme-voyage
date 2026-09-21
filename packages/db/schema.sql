-- SAFAR Database Schema for Supabase

-- Enable RLS
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  language VARCHAR(5) DEFAULT 'en',
  subscription_tier VARCHAR(20) DEFAULT 'free',
  messages_used_today INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget_usd DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'planning',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Community tips table
CREATE TABLE IF NOT EXISTS community_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  category VARCHAR(50),
  content TEXT NOT NULL,
  rating DECIMAL(2, 1) DEFAULT 0.0,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversation logs table
CREATE TABLE IF NOT EXISTS conversation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_history JSONB NOT NULL,
  agents_used TEXT[] DEFAULT '{}',
  summary TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent interactions table (for logging/monitoring)
CREATE TABLE IF NOT EXISTS agent_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agent_name VARCHAR(50) NOT NULL,
  user_message TEXT NOT NULL,
  agent_response TEXT NOT NULL,
  confidence DECIMAL(3, 2),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscription logs
CREATE TABLE IF NOT EXISTS subscription_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier_before VARCHAR(20),
  tier_after VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_community_tips_location ON community_tips(location);
CREATE INDEX idx_community_tips_rating ON community_tips(rating DESC);
CREATE INDEX idx_conversation_logs_user_id ON conversation_logs(user_id);
CREATE INDEX idx_agent_interactions_user_id ON agent_interactions(user_id);
CREATE INDEX idx_agent_interactions_agent ON agent_interactions(agent_name);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_interactions ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Trips: Users can read/write their own
CREATE POLICY "Users can read own trips" ON trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" ON trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" ON trips
  FOR DELETE USING (auth.uid() = user_id);

-- Community tips: Everyone can read, users can create their own
CREATE POLICY "Anyone can read tips" ON community_tips
  FOR SELECT USING (true);

CREATE POLICY "Users can create tips" ON community_tips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tips" ON community_tips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tips" ON community_tips
  FOR DELETE USING (auth.uid() = user_id);

-- Conversation logs: Users can only read/write their own
CREATE POLICY "Users can read own logs" ON conversation_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create logs" ON conversation_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Agent interactions: Only for logging, users can read their own
CREATE POLICY "Users can read own interactions" ON agent_interactions
  FOR SELECT USING (auth.uid() = user_id);

-- Stripe customers (for payment processing)
CREATE TABLE IF NOT EXISTS stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Premium subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  tier VARCHAR(20) NOT NULL DEFAULT 'premium',
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Saved favorites (caftans & properties)
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL,
  item_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- Indexes for subscriptions
CREATE INDEX idx_stripe_customers_user ON stripe_customers(user_id);
CREATE INDEX idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_favorites_user ON favorites(user_id);

-- RLS for subscriptions
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own stripe customer" ON stripe_customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can read own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Affiliate tracking tables
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  program VARCHAR(50) NOT NULL,
  source VARCHAR(100),
  destination VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  ip_hash VARCHAR(64),
  user_agent_hash VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  click_id UUID REFERENCES affiliate_clicks(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  program VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'EUR',
  commission_rate DECIMAL(5, 2),
  commission_earned DECIMAL(10, 2),
  conversion_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for affiliate tracking
CREATE INDEX idx_affiliate_clicks_program ON affiliate_clicks(program);
CREATE INDEX idx_affiliate_clicks_user ON affiliate_clicks(user_id);
CREATE INDEX idx_affiliate_clicks_created ON affiliate_clicks(created_at DESC);
CREATE INDEX idx_affiliate_conversions_user ON affiliate_conversions(user_id);
CREATE INDEX idx_affiliate_conversions_status ON affiliate_conversions(status);
CREATE INDEX idx_affiliate_conversions_program ON affiliate_conversions(program);

-- RLS for affiliate tables
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own affiliate clicks" ON affiliate_clicks
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create affiliate clicks" ON affiliate_clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read own conversions" ON affiliate_conversions
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Conversions can be created by system" ON affiliate_conversions
  FOR INSERT WITH CHECK (true);

-- Stripe Connect for affiliate payouts
CREATE TABLE IF NOT EXISTS user_stripe_connect (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  stripe_connect_id TEXT UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  email TEXT,
  country VARCHAR(2),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Affiliate payout records
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_connect_id TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  stripe_transfer_id TEXT,
  stripe_payout_id TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Partner webhook audit log
CREATE TABLE IF NOT EXISTS affiliate_partner_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program VARCHAR(50) NOT NULL,
  payload_hash VARCHAR(64) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending',
  payload JSONB,
  error_message TEXT,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Connect tables
CREATE INDEX idx_user_stripe_connect_user ON user_stripe_connect(user_id);
CREATE INDEX idx_user_stripe_connect_stripe_id ON user_stripe_connect(stripe_connect_id);
CREATE INDEX idx_affiliate_payouts_user ON affiliate_payouts(user_id);
CREATE INDEX idx_affiliate_payouts_status ON affiliate_payouts(status);
CREATE INDEX idx_affiliate_payouts_period ON affiliate_payouts(period_start, period_end);
CREATE INDEX idx_affiliate_partner_webhooks_program ON affiliate_partner_webhooks(program);
CREATE INDEX idx_affiliate_partner_webhooks_created ON affiliate_partner_webhooks(created_at DESC);

-- RLS for Connect tables
ALTER TABLE user_stripe_connect ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_partner_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own Connect account" ON user_stripe_connect
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own Connect account" ON user_stripe_connect
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own payouts" ON affiliate_payouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create payouts" ON affiliate_payouts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Partner webhooks are internal only" ON affiliate_partner_webhooks
  FOR SELECT USING (false);

CREATE POLICY "System can log webhooks" ON affiliate_partner_webhooks
  FOR INSERT WITH CHECK (true);
