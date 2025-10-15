-- ═══════════════════════════════════════════════════════════════════════════
-- مُثمّن AI - Database Schema for Neon PostgreSQL
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════════════
-- جدول المستخدمين (Users Table)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    referral_code VARCHAR(8) UNIQUE NOT NULL,
    referred_by_code VARCHAR(8),
    subscription_type VARCHAR(50) DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    pro_days_remaining INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    total_referrals INTEGER DEFAULT 0,
    total_evaluations INTEGER DEFAULT 0
);

-- Index for faster lookups
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_referred_by ON users(referred_by_code);

-- ═══════════════════════════════════════════════════════════════════════════
-- جدول الإحالات (Referrals Table)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(8) NOT NULL,
    reward_days INTEGER DEFAULT 2,
    reward_applied BOOLEAN DEFAULT false,
    reward_applied_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending'
);

-- Indexes
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);

-- ═══════════════════════════════════════════════════════════════════════════
-- جدول الاشتراكات (Subscriptions Table)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INTEGER NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP,
    auto_renew BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_active ON subscriptions(is_active);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);

-- ═══════════════════════════════════════════════════════════════════════════
-- جدول التقييمات (Evaluations Table)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    property_type VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100),
    area DECIMAL(10, 2) NOT NULL,
    rooms INTEGER,
    bathrooms INTEGER,
    age INTEGER,
    estimated_value DECIMAL(15, 2) NOT NULL,
    confidence INTEGER,
    price_range_min DECIMAL(15, 2),
    price_range_max DECIMAL(15, 2),
    engine_used VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Indexes
CREATE INDEX idx_evaluations_user ON evaluations(user_id);
CREATE INDEX idx_evaluations_city ON evaluations(city);
CREATE INDEX idx_evaluations_created_at ON evaluations(created_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- جدول سجل النشاطات (Activity Log)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    metadata JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_action ON activity_log(action);
CREATE INDEX idx_activity_created_at ON activity_log(created_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- Functions & Triggers
-- ═══════════════════════════════════════════════════════════════════════════

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to apply referral reward
CREATE OR REPLACE FUNCTION apply_referral_reward()
RETURNS TRIGGER AS $$
BEGIN
    -- Update referrer's pro days
    UPDATE users 
    SET pro_days_remaining = pro_days_remaining + NEW.reward_days,
        total_referrals = total_referrals + 1
    WHERE id = NEW.referrer_id;
    
    -- Mark reward as applied
    NEW.reward_applied = true;
    NEW.reward_applied_at = CURRENT_TIMESTAMP;
    NEW.status = 'completed';
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-apply referral rewards
CREATE TRIGGER auto_apply_referral_reward BEFORE INSERT ON referrals
    FOR EACH ROW EXECUTE FUNCTION apply_referral_reward();

-- ═══════════════════════════════════════════════════════════════════════════
-- Initial Data / Seed
-- ═══════════════════════════════════════════════════════════════════════════

-- Insert admin user (optional)
INSERT INTO users (name, email, phone, referral_code, subscription_type, is_active)
VALUES ('Admin', 'admin@mothammen.ai', '+966500000000', 'ADMIN001', 'unlimited', true)
ON CONFLICT (email) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- Views for Analytics
-- ═══════════════════════════════════════════════════════════════════════════

-- View: User statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE subscription_type = 'free') as free_users,
    COUNT(*) FILTER (WHERE subscription_type = 'basic') as basic_users,
    COUNT(*) FILTER (WHERE subscription_type = 'pro') as pro_users,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_users_week,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_month
FROM users
WHERE is_active = true;

-- View: Referral statistics
CREATE OR REPLACE VIEW referral_stats AS
SELECT 
    COUNT(*) as total_referrals,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_referrals,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_referrals,
    SUM(reward_days) FILTER (WHERE reward_applied = true) as total_reward_days_given,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as referrals_this_week
FROM referrals;

-- View: Top referrers
CREATE OR REPLACE VIEW top_referrers AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.referral_code,
    u.total_referrals,
    u.pro_days_remaining,
    COUNT(r.id) as successful_referrals
FROM users u
LEFT JOIN referrals r ON u.id = r.referrer_id AND r.status = 'completed'
GROUP BY u.id, u.name, u.email, u.referral_code, u.total_referrals, u.pro_days_remaining
ORDER BY u.total_referrals DESC
LIMIT 100;

-- View: Revenue statistics (for subscriptions)
CREATE OR REPLACE VIEW revenue_stats AS
SELECT 
    COUNT(*) as total_subscriptions,
    SUM(price) as total_revenue,
    SUM(price) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as revenue_this_month,
    AVG(price) as average_subscription_price,
    COUNT(*) FILTER (WHERE is_active = true) as active_subscriptions
FROM subscriptions;

-- ═══════════════════════════════════════════════════════════════════════════
-- Comments
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE users IS 'جدول المستخدمين المسجلين في التطبيق';
COMMENT ON TABLE referrals IS 'جدول الإحالات ومكافآتها';
COMMENT ON TABLE subscriptions IS 'جدول الاشتراكات المدفوعة';
COMMENT ON TABLE evaluations IS 'جدول تقييمات العقارات';
COMMENT ON TABLE activity_log IS 'سجل نشاطات المستخدمين';

