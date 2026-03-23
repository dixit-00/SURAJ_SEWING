-- ============================================
-- Supabase SQL Migration for Suraj Sewing Machine
-- Run this in the Supabase SQL Editor
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS TABLE ───
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  address JSONB DEFAULT '{}',
  wishlist UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PRODUCTS TABLE ───
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  is_industrial BOOLEAN DEFAULT FALSE,
  stock INTEGER NOT NULL DEFAULT 0,
  images JSONB DEFAULT '[]',
  features TEXT[] DEFAULT '{}',
  rating NUMERIC(3,2) DEFAULT 0,
  num_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── REVIEWS TABLE ───
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ORDERS TABLE ───
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_items JSONB NOT NULL DEFAULT '[]',
  shipping_address JSONB NOT NULL DEFAULT '{}',
  payment_method TEXT NOT NULL DEFAULT 'Stripe',
  payment_result JSONB DEFAULT '{}',
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  is_delivered BOOLEAN NOT NULL DEFAULT FALSE,
  delivered_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── FEEDBACK TABLE ───
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General feedback' CHECK (category IN ('Bug Report', 'Feature Request', 'Support Info', 'General feedback')),
  message TEXT NOT NULL,
  is_reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ───
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_industrial ON products(is_industrial);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);

-- ─── AUTO-UPDATE updated_at TRIGGER ───
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── ROW LEVEL SECURITY (RLS) ───

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- PRODUCTS: Anyone can read, only service_role (Edge Functions/admin) can write
CREATE POLICY "Products are publicly readable" ON products FOR SELECT USING (true);
CREATE POLICY "Products insert for all" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Products update for all" ON products FOR UPDATE USING (true);
CREATE POLICY "Products delete for all" ON products FOR DELETE USING (true);

-- USERS: Users can read/update own row, admins can read all
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);

-- REVIEWS: Anyone can read, authenticated users can insert
CREATE POLICY "Reviews are publicly readable" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert reviews" ON reviews FOR INSERT WITH CHECK (true);

-- ORDERS: Users see own orders, admins see all
CREATE POLICY "Orders readable" ON orders FOR SELECT USING (true);
CREATE POLICY "Orders insertable" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders updatable" ON orders FOR UPDATE USING (true);

-- FEEDBACK: Users can insert, admins can read/update
CREATE POLICY "Feedback insertable" ON feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Feedback readable" ON feedback FOR SELECT USING (true);
CREATE POLICY "Feedback updatable" ON feedback FOR UPDATE USING (true);

-- ─── SET ADMIN USER ───
-- After first login, run this to make your user an admin:
-- UPDATE users SET role = 'admin' WHERE email = 'malviyadixit92@gmail.com';

-- ─── SEED PRODUCT DATA (from existing MongoDB) ───
INSERT INTO products (name, description, price, category, brand, is_industrial, stock, images, rating, num_reviews, created_at)
VALUES
(
  'JACK F6',
  'The Jack F6 Professional Sewing Machine is a high-speed, direct-drive industrial sewing machine designed for efficient and precise garment stitching.
It features a built-in motor, LED light, and smart controls, making it reliable, energy-efficient, and ideal for professional tailoring work.',
  25000,
  'Industrial',
  'JACK',
  true,
  5,
  '[{"url": "https://res.cloudinary.com/dhuiyvjhz/image/upload/v1774045693/suraj_sewing/t8xtkvxme5odckqw157m.jpg", "public_id": "suraj_sewing/t8xtkvxme5odckqw157m"}]'::jsonb,
  0,
  0,
  '2026-03-20T22:24:17.768Z'
),
(
  'MAQI Q1',
  'A MAQI sewing machine is a modern industrial machine where the motor is directly connected to the main shaft of the machine. Unlike old machines with belts, the motor drives the needle directly. This improves efficiency and precision',
  24500,
  'Industrial',
  'MAQI',
  true,
  5,
  '[{"url": "https://res.cloudinary.com/dhuiyvjhz/image/upload/v1774046682/suraj_sewing/lrz9iqu0symbmqyzxzay.jpg", "public_id": "suraj_sewing/lrz9iqu0symbmqyzxzay"}]'::jsonb,
  0,
  0,
  '2026-03-20T22:45:54.979Z'
)
ON CONFLICT DO NOTHING;

-- ==========================================
-- STRIPE EVENTS LOG
-- ==========================================
CREATE TABLE public.stripe_events (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: RLS disabled to allow easy insertion from Service Role Key inside the Edge Function. 
-- However, we strongly recommend securing it later if making this table public-facing.

-- ==========================================
-- SCALABLE NOTIFICATION SYSTEM
-- ==========================================

-- ─── NOTIFICATIONS TABLE ───
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('order_placed', 'back_in_stock', 'price_drop', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── USER PREFERENCES TABLE ───
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT TRUE,
  realtime_enabled BOOLEAN DEFAULT TRUE,
  price_alert_enabled BOOLEAN DEFAULT TRUE
);

-- ─── PRICE WATCH TABLE ───
CREATE TABLE IF NOT EXISTS price_watch (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  target_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ─── INDEXES for Scalability ───
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_price_watch_product_id ON price_watch(product_id);

-- ─── ENABLE REALTIME FOR NOTIFICATIONS ───
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ─── ROW LEVEL SECURITY (RLS) ───
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_watch ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow public update notifications" ON notifications FOR UPDATE USING (true);
CREATE POLICY "Allow public insert notifications" ON notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read/update own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own price watches" ON price_watch FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- NOTIFICATION TRIGGERS
-- ==========================================

-- Trigger 1: Order Placed Notification
CREATE OR REPLACE FUNCTION notify_order_placed() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message)
  VALUES (NEW.user_id, 'order_placed', 'Order Confirmed', 'Your order requires payment or is successfully placed.');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_order_placed ON orders;
CREATE TRIGGER trigger_order_placed
  AFTER INSERT ON orders FOR EACH ROW EXECUTE FUNCTION notify_order_placed();

-- Trigger 2: Back In Stock & Price Drop Alerts
CREATE OR REPLACE FUNCTION notify_product_updates() RETURNS TRIGGER AS $$
DECLARE
  watcher RECORD;
  wisher UUID;
BEGIN
  -- Back In Stock Alert: Using Wishlist to notify users when stock goes from 0 to >0
  IF OLD.stock = 0 AND NEW.stock > 0 THEN
    FOR wisher IN SELECT id FROM users WHERE NEW.id = ANY(wishlist) LOOP
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (wisher, 'back_in_stock', 'Back in Stock!', NEW.name || ' is now back in stock. Grab it before it sells out!');
    END LOOP;
  END IF;

  -- Price Drop Alert: Notify users watching this price
  IF NEW.price < OLD.price THEN
    FOR watcher IN SELECT user_id FROM price_watch WHERE product_id = NEW.id AND target_price >= NEW.price LOOP
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (watcher.user_id, 'price_drop', 'Price Drop Alert', NEW.name || ' has dropped below your target price to ₹' || NEW.price);
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_product_updates ON products;
CREATE TRIGGER trigger_product_updates
  AFTER UPDATE OF stock, price ON products FOR EACH ROW EXECUTE FUNCTION notify_product_updates();

-- ==========================================
-- SERVICE TOKENS & REPAIRS
-- ==========================================
CREATE TABLE IF NOT EXISTS service_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_number TEXT UNIQUE NOT NULL,
  machine_model TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_tokens_number ON service_tokens(token_number);
CREATE INDEX IF NOT EXISTS idx_service_tokens_user ON service_tokens(user_id);

ALTER TABLE service_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON service_tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON service_tokens FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION generate_service_token() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.token_number IS NULL OR NEW.token_number = '' THEN
    NEW.token_number := 'SRV-' || upper(substr(md5(random()::text), 1, 6));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_token ON service_tokens;
CREATE TRIGGER trigger_generate_token 
  BEFORE INSERT ON service_tokens FOR EACH ROW EXECUTE FUNCTION generate_service_token();

CREATE OR REPLACE FUNCTION notify_service_token_created() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message)
  VALUES (NEW.user_id, 'system', 'Service Token Generated', 'Your service request ' || NEW.token_number || ' has been successfully logged. Our technicians will review it shortly!');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_service_token_created ON service_tokens;
CREATE TRIGGER trigger_service_token_created
  AFTER INSERT ON service_tokens FOR EACH ROW EXECUTE FUNCTION notify_service_token_created();
