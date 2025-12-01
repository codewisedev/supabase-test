CREATE TABLE IF NOT EXISTS attribute_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attribute_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_type_id uuid NOT NULL REFERENCES attribute_types(id) ON DELETE CASCADE,
  value text NOT NULL,
  display_value text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(attribute_type_id, value)
);

CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku text,
  price numeric,
  discount_price numeric,
  stock_quantity integer DEFAULT 0,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS variant_attributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  attribute_value_id uuid NOT NULL REFERENCES attribute_values(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(variant_id, attribute_value_id)
);

ALTER TABLE cart_items DROP CONSTRAINT cart_items_product_id_fkey;
ALTER TABLE cart_items DROP COLUMN product_id;
ALTER TABLE cart_items ADD COLUMN variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE;
ALTER TABLE cart_items ADD CONSTRAINT unique_user_variant UNIQUE(user_id, variant_id);

CREATE INDEX IF NOT EXISTS idx_attribute_values_type_id ON attribute_values(attribute_type_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variant_attributes_variant_id ON variant_attributes(variant_id);
CREATE INDEX IF NOT EXISTS idx_variant_attributes_value_id ON variant_attributes(attribute_value_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON cart_items(variant_id);

ALTER TABLE attribute_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attribute types are publicly readable"
  ON attribute_types
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Attribute values are publicly readable"
  ON attribute_values
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Product variants are publicly readable"
  ON product_variants
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Variant attributes are publicly readable"
  ON variant_attributes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert attribute types"
  ON attribute_types
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update attribute types"
  ON attribute_types
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete attribute types"
  ON attribute_types
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');