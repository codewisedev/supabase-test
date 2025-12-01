DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'cart_items' AND column_name = 'product_id'
    ) THEN
        ALTER TABLE cart_items
        ADD COLUMN product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'cart_items' AND column_name = 'variant_id'
    ) THEN
        ALTER TABLE cart_items
        ADD COLUMN variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE;
    END IF;
END
$$;

ALTER TABLE cart_items 
DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;

ALTER TABLE cart_items 
ADD CONSTRAINT cart_items_user_id_product_id_variant_id_key 
UNIQUE(user_id, product_id, variant_id);