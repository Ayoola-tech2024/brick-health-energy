-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE flash_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Products: public read, admin write
CREATE POLICY "Products public read" ON products FOR SELECT USING (true);
CREATE POLICY "Products admin write" ON products FOR ALL USING (auth.role() = 'service_role');

-- Users: own row only
CREATE POLICY "Users own read" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users own update" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users admin read" ON users FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Users admin write" ON users FOR ALL USING (auth.role() = 'service_role');

-- Orders: own orders only (or admin)
CREATE POLICY "Orders own select" ON orders FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "Orders own insert" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "Orders own update" ON orders FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Cart: own cart only
CREATE POLICY "Cart own select" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Cart own insert" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Cart own update" ON cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Cart own delete" ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- Store settings: public read, admin write
CREATE POLICY "Store settings public read" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Store settings admin write" ON store_settings FOR ALL USING (auth.role() = 'service_role');

-- Reviews: public read, authenticated write
CREATE POLICY "Reviews public read" ON product_reviews FOR SELECT USING (true);
CREATE POLICY "Reviews own insert" ON product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Reviews own update" ON product_reviews FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "Reviews own delete" ON product_reviews FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Discounts: public select (for validation), admin write
CREATE POLICY "Discounts public read" ON discounts FOR SELECT USING (true);
CREATE POLICY "Discounts admin write" ON discounts FOR ALL USING (auth.role() = 'service_role');

-- Flash deals: public select (active only), admin write
CREATE POLICY "Flash deals public read" ON flash_deals FOR SELECT USING (active = true OR auth.role() = 'service_role');
CREATE POLICY "Flash deals admin write" ON flash_deals FOR ALL USING (auth.role() = 'service_role');

-- Contact: public insert, admin read
CREATE POLICY "Contact public insert" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Contact admin read" ON contact_messages FOR SELECT USING (auth.role() = 'service_role');

-- Wishlist: own only
CREATE POLICY "Wishlist own select" ON wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Wishlist own insert" ON wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Wishlist own delete" ON wishlist FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);

-- Seed store settings
INSERT INTO store_settings (store_name, store_description, currency, delivery_fee, free_delivery_threshold, phone, email, address)
VALUES (
  'Brick Health Energy Solutions',
  'Premium Brick Health energy solutions — smokeless biomass stoves and eco-fuels.',
  'NGN',
  2000,
  50000,
  '+234 703 568 9394',
  'info@brickhealthenergy.org',
  'Lagos, Nigeria'
)
ON CONFLICT DO NOTHING;
