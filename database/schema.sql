-- ============================================================================
-- Calling System Supabase Database Schema
-- نظام إدارة الطلبات والمتابعة - قاعدة البيانات
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: users (المستخدمين)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'employee', 'store')),
    store TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_store ON users(store);

-- ============================================================================
-- TABLE: orders (الطلبات)
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Core columns
    order_code TEXT UNIQUE NOT NULL,
    customer_phone TEXT NOT NULL,
    employee_name TEXT,
    store TEXT,
    product_name TEXT,
    price NUMERIC(10, 2),
    order_note TEXT,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Shipment info
    shipment_status TEXT,
    representative_number TEXT,
    representative_note TEXT,
    shipping_company TEXT,
    
    -- Client status
    client_status TEXT,
    client_note TEXT,
    call_attempts INTEGER DEFAULT 0,
    more_than_5_attempts BOOLEAN DEFAULT FALSE,
    
    -- Return info
    return_status TEXT,
    admin_alert TEXT,
    admin_note TEXT,
    
    -- Calculated columns
    delivered TEXT DEFAULT 'no',
    filter TEXT DEFAULT 'no',
    delivery_filter TEXT DEFAULT NULL,
    dashboard_filter TEXT DEFAULT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_order_code ON orders(order_code);
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_orders_employee_name ON orders(employee_name);
CREATE INDEX idx_orders_store ON orders(store);
CREATE INDEX idx_orders_client_status ON orders(client_status);
CREATE INDEX idx_orders_shipment_status ON orders(shipment_status);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_dashboard_filter ON orders(dashboard_filter);
CREATE INDEX idx_orders_delivered ON orders(delivered);

-- ============================================================================
-- TABLE: deliveries (التسليمات)
-- ============================================================================
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    store TEXT,
    delivery_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(order_code)
);

CREATE INDEX idx_deliveries_order_code ON deliveries(order_code);
CREATE INDEX idx_deliveries_customer_phone ON deliveries(customer_phone);
CREATE INDEX idx_deliveries_delivery_date ON deliveries(delivery_date);

-- ============================================================================
-- TABLE: test_orders (الطلبات التجريبية)
-- ============================================================================
CREATE TABLE IF NOT EXISTS test_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code TEXT UNIQUE NOT NULL,
    customer_phone TEXT,
    store TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_test_orders_order_code ON test_orders(order_code);

-- ============================================================================
-- TABLE: follow_up_orders (الطلبات التي تحتاج متابعة)
-- ============================================================================
CREATE TABLE IF NOT EXISTS follow_up_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code TEXT NOT NULL,
    customer_phone TEXT,
    store TEXT,
    employee_name TEXT,
    follow_up_status TEXT DEFAULT 'pending',
    follow_up_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_follow_up_orders_order_code ON follow_up_orders(order_code);
CREATE INDEX idx_follow_up_orders_status ON follow_up_orders(follow_up_status);
CREATE INDEX idx_follow_up_orders_store ON follow_up_orders(store);

-- ============================================================================
-- TABLE: archived_orders (الطلبات المؤرشفة)
-- ============================================================================
CREATE TABLE IF NOT EXISTS archived_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Same columns as orders
    order_code TEXT NOT NULL,
    customer_phone TEXT,
    employee_name TEXT,
    store TEXT,
    product_name TEXT,
    price NUMERIC(10, 2),
    order_note TEXT,
    order_date TIMESTAMP WITH TIME ZONE,
    
    shipment_status TEXT,
    representative_number TEXT,
    representative_note TEXT,
    shipping_company TEXT,
    
    client_status TEXT,
    client_note TEXT,
    call_attempts INTEGER,
    
    return_status TEXT,
    admin_note TEXT,
    
    delivered TEXT,
    delivery_filter TEXT,
    
    archived_reason TEXT,
    archived_by UUID REFERENCES users(id),
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_archived_orders_order_code ON archived_orders(order_code);
CREATE INDEX idx_archived_orders_archived_at ON archived_orders(archived_at);
CREATE INDEX idx_archived_orders_employee ON archived_orders(employee_name);

-- ============================================================================
-- TABLE: store_orders_status (حالة الطلبات لكل متجر)
-- ============================================================================
CREATE TABLE IF NOT EXISTS store_orders_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code TEXT UNIQUE NOT NULL REFERENCES orders(order_code) ON DELETE CASCADE,
    store TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('رد و يستلم', 'استبدال', 'مرتجع', 'مؤجل')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_store_orders_status_store ON store_orders_status(store);
CREATE INDEX idx_store_orders_status_status ON store_orders_status(status);
CREATE INDEX idx_store_orders_status_order_code ON store_orders_status(order_code);

-- ============================================================================
-- FUNCTION: recalculate_calculated_columns()
-- Recalculates delivered, delivery_filter, filter, and dashboard_filter
-- ============================================================================
CREATE OR REPLACE FUNCTION recalculate_calculated_columns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Step 1: Reset calculated columns
    UPDATE orders SET
        delivered = 'no',
        delivery_filter = NULL,
        dashboard_filter = NULL;

    -- Step 2: Direct order_code + store match
    UPDATE orders o
    SET
        delivered = 'yes',
        delivery_filter = 'تم التسليم بنفس الكود'
    FROM deliveries d
    WHERE d.order_code = o.order_code
      AND (d.store = o.store OR d.store IS NULL OR o.store IS NULL);

    -- Step 3: Match un-delivered orders with external deliveries
    WITH unmatched_orders AS (
        SELECT
            id,
            customer_phone,
            store,
            ROW_NUMBER() OVER (
                PARTITION BY customer_phone, store
                ORDER BY order_date ASC, id ASC
            ) AS order_idx
        FROM orders
        WHERE delivered = 'no'
    ),
    unmatched_deliveries AS (
        SELECT
            d.order_code AS deliv_code,
            d.customer_phone,
            d.store,
            ROW_NUMBER() OVER (
                PARTITION BY d.customer_phone, d.store
                ORDER BY d.delivery_date ASC, d.id ASC
            ) AS deliv_idx
        FROM deliveries d
        WHERE NOT EXISTS (
            SELECT 1 FROM orders o2 WHERE o2.order_code = d.order_code
        )
    ),
    matched_pairs AS (
        SELECT
            uo.id AS order_id,
            ud.deliv_code
        FROM unmatched_orders uo
        JOIN unmatched_deliveries ud
          ON uo.customer_phone = ud.customer_phone
         AND (uo.store = ud.store OR uo.store IS NULL OR ud.store IS NULL)
         AND uo.order_idx = ud.deliv_idx
    )
    UPDATE orders o
    SET
        delivered = 'yes',
        delivery_filter = CONCAT('استلم بكود آخر - ', mp.deliv_code)
    FROM matched_pairs mp
    WHERE o.id = mp.order_id;

    -- Step 4: Set dashboard_filter
    WITH customer_store_stats AS (
        SELECT
            id,
            delivered,
            MAX(
                CASE WHEN delivered = 'yes' THEN 1 ELSE 0 END
            ) OVER (PARTITION BY customer_phone, store) AS customer_has_delivered,
            ROW_NUMBER() OVER (
                PARTITION BY customer_phone, store, delivered
                ORDER BY order_date ASC, id ASC
            ) AS order_rank_in_group
        FROM orders
    )
    UPDATE orders o
    SET dashboard_filter = CASE
        WHEN css.delivered = 'yes' THEN 'Yes'
        WHEN css.customer_has_delivered = 1 THEN 'Ignore'
        WHEN css.order_rank_in_group = 1 THEN 'No'
        ELSE 'Ignore'
    END
    FROM customer_store_stats css
    WHERE o.id = css.id;

    -- Step 5: Mark test orders
    UPDATE orders o
    SET filter = 'yes'
    FROM test_orders t
    WHERE t.order_code = o.order_code;

END;
$$;

-- ============================================================================
-- TRIGGER: auto_update_timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_orders_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_follow_up_timestamp
BEFORE UPDATE ON follow_up_orders
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_store_status_timestamp
BEFORE UPDATE ON store_orders_status
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- RLS: Row Level Security Policies
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_orders_status ENABLE ROW LEVEL SECURITY;

-- ORDERS: Public read visible orders
CREATE POLICY "Public can read visible orders" ON orders
    FOR SELECT
    USING (dashboard_filter IS NULL OR dashboard_filter != 'Ignore');

-- ORDERS: Admin-only update
CREATE POLICY "Admins can update orders" ON orders
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- DELIVERIES: Public read
CREATE POLICY "Public can read deliveries" ON deliveries
    FOR SELECT
    USING (true);

-- DELIVERIES: Admin-only insert/update/delete
CREATE POLICY "Admins can manage deliveries" ON deliveries
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- TEST_ORDERS: Public read
CREATE POLICY "Public can read test_orders" ON test_orders
    FOR SELECT
    USING (true);

-- TEST_ORDERS: Admin-only manage
CREATE POLICY "Admins can manage test_orders" ON test_orders
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- FOLLOW_UP_ORDERS: Employees can read their own
CREATE POLICY "Employees can read follow up orders" ON follow_up_orders
    FOR SELECT
    USING (true);

-- STORE_ORDERS_STATUS: Store managers can read
CREATE POLICY "Store managers can read order status" ON store_orders_status
    FOR SELECT
    USING (true);

-- STORE_ORDERS_STATUS: Store managers can update
CREATE POLICY "Store managers can update order status" ON store_orders_status
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- VIEWS: For Dashboard Queries
-- ============================================================================

-- View: Employee Statistics
CREATE OR REPLACE VIEW employee_statistics AS
SELECT
    employee_name,
    COUNT(*) as total_orders,
    SUM(CASE WHEN delivered = 'yes' THEN 1 ELSE 0 END) as delivered_count,
    SUM(CASE WHEN delivered = 'no' THEN 1 ELSE 0 END) as not_delivered_count,
    ROUND(
        CAST(SUM(CASE WHEN delivered = 'yes' THEN 1 ELSE 0 END) AS FLOAT) * 100 / 
        NULLIF(COUNT(*), 0),
        2
    ) as delivery_percentage
FROM orders
WHERE employee_name IS NOT NULL
  AND (dashboard_filter IS NULL OR dashboard_filter != 'Ignore')
GROUP BY employee_name
ORDER BY delivery_percentage DESC;

-- View: Store Statistics
CREATE OR REPLACE VIEW store_statistics AS
SELECT
    store,
    COUNT(*) as total_orders,
    SUM(CASE WHEN delivered = 'yes' THEN 1 ELSE 0 END) as delivered_count,
    SUM(CASE WHEN delivered = 'no' THEN 1 ELSE 0 END) as not_delivered_count,
    ROUND(
        CAST(SUM(CASE WHEN delivered = 'yes' THEN 1 ELSE 0 END) AS FLOAT) * 100 / 
        NULLIF(COUNT(*), 0),
        2
    ) as delivery_percentage
FROM orders
WHERE store IS NOT NULL
  AND (dashboard_filter IS NULL OR dashboard_filter != 'Ignore')
GROUP BY store
ORDER BY delivery_percentage DESC;

-- View: Client Status Statistics
CREATE OR REPLACE VIEW client_status_statistics AS
SELECT
    client_status,
    COUNT(*) as total_orders,
    SUM(CASE WHEN delivered = 'yes' THEN 1 ELSE 0 END) as delivered_count,
    SUM(CASE WHEN delivered = 'no' THEN 1 ELSE 0 END) as not_delivered_count,
    ROUND(
        CAST(SUM(CASE WHEN delivered = 'yes' THEN 1 ELSE 0 END) AS FLOAT) * 100 / 
        NULLIF(COUNT(*), 0),
        2
    ) as delivery_percentage,
    ROUND(
        CAST(COUNT(*) AS FLOAT) * 100 / 
        (SELECT COUNT(*) FROM orders WHERE dashboard_filter IS NULL OR dashboard_filter != 'Ignore'),
        2
    ) as percentage_of_total
FROM orders
WHERE client_status IS NOT NULL
  AND (dashboard_filter IS NULL OR dashboard_filter != 'Ignore')
GROUP BY client_status
ORDER BY total_orders DESC;

-- View: Shipment Status Statistics
CREATE OR REPLACE VIEW shipment_status_statistics AS
SELECT
    shipment_status,
    COUNT(*) as total_orders,
    SUM(CASE WHEN delivered = 'yes' THEN 1 ELSE 0 END) as delivered_count,
    SUM(CASE WHEN delivered = 'no' THEN 1 ELSE 0 END) as not_delivered_count,
    ROUND(
        CAST(SUM(CASE WHEN delivered = 'yes' THEN 1 ELSE 0 END) AS FLOAT) * 100 / 
        NULLIF(COUNT(*), 0),
        2
    ) as delivery_percentage
FROM orders
WHERE shipment_status IS NOT NULL
  AND (dashboard_filter IS NULL OR dashboard_filter != 'Ignore')
GROUP BY shipment_status
ORDER BY total_orders DESC;
