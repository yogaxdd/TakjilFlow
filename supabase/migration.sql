-- =============================================
-- TakjilFlow Database Schema (Full)
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- SELLER PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS seller_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT DEFAULT 'Toko Saya',
  store_description TEXT DEFAULT '',
  whatsapp_number TEXT DEFAULT '',
  banner_url TEXT DEFAULT '',
  ewallet_number TEXT DEFAULT '',
  ewallet_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  stock_limit INTEGER NOT NULL DEFAULT 0,
  image_url TEXT DEFAULT '',
  category TEXT DEFAULT 'Lainnya',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PROMO CODES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER NOT NULL DEFAULT 100,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT DEFAULT '',
  payment_method TEXT NOT NULL DEFAULT 'cod',
  promo_code TEXT DEFAULT '',
  discount_amount INTEGER NOT NULL DEFAULT 0,
  order_notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- SELLER PROFILES RLS
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON seller_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile"
  ON seller_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON seller_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view seller profiles"
  ON seller_profiles FOR SELECT
  USING (true);

-- PRODUCTS RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

-- PROMO CODES RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own promos"
  ON promo_codes FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active promos"
  ON promo_codes FOR SELECT
  USING (is_active = true);

-- ORDERS RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sellers can view their product orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = orders.product_id
      AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Sellers can update their product orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = orders.product_id
      AND products.user_id = auth.uid()
    )
  );

-- =============================================
-- STORAGE BUCKET (product images)
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
