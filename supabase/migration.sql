-- =============================================
-- TakjilFlow Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Users can SELECT their own products
CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

-- Users can INSERT their own products
CREATE POLICY "Users can create own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can UPDATE their own products
CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can DELETE their own products
CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

-- Anyone can view products (for public store page)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Anyone can insert orders (customers placing orders)
CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Sellers can view orders for their products
CREATE POLICY "Sellers can view their product orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = orders.product_id
      AND products.user_id = auth.uid()
    )
  );

-- Anyone can view orders (for public access)
CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT
  USING (true);

-- Allow sellers to update their product orders
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
-- Run this in SQL Editor or create the bucket manually in Supabase Dashboard:
-- 1. Go to Storage > New Bucket
-- 2. Name: "product-images"
-- 3. Set as PUBLIC bucket
--
-- Then add these storage policies:

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view product images (public)
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Authenticated users can upload images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND auth.role() = 'authenticated'
);

-- Users can update their own uploaded images
CREATE POLICY "Users can update own product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own uploaded images
CREATE POLICY "Users can delete own product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
