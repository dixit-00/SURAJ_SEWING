-- ==========================================
-- TRACKING TABLES (VISITORS & CART EVENTS)
-- ==========================================

-- ─── VISITORS TABLE ───
-- Tracks sessions and links them to users when they log in
CREATE TABLE IF NOT EXISTS public.visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id UUID NOT NULL UNIQUE, -- Persistent ID stored in localStorage
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_agent TEXT,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CART EVENTS TABLE ───
-- Tracks "Add to Cart" and "Remove from Cart" actions
CREATE TABLE IF NOT EXISTS public.cart_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id UUID NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('add', 'remove')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ───
CREATE INDEX IF NOT EXISTS idx_visitors_visitor_id ON public.visitors(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitors_user_id ON public.visitors(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_visitor_id ON public.cart_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_product_id ON public.cart_events(product_id);

-- ─── RLS ───
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_events ENABLE ROW LEVEL SECURITY;

-- Allow public insert/update for tracking (anonymous users need to insert)
CREATE POLICY "Allow anonymous visitor insert" ON public.visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous visitor update" ON public.visitors FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous visitor select" ON public.visitors FOR SELECT USING (true);

CREATE POLICY "Allow anonymous cart_event insert" ON public.cart_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous cart_event select" ON public.cart_events FOR SELECT USING (true);

-- ─── REALTIME ───
-- Enable realtime for the visitors table so admin can see live updates
ALTER PUBLICATION supabase_realtime ADD TABLE visitors;
ALTER PUBLICATION supabase_realtime ADD TABLE cart_events;
