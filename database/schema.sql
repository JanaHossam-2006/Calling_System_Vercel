-- Calling System Database Schema for Supabase
-- Table 1: Users (المستخدمين)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'employee', 'store')),
    available_stores VARCHAR(1000),
    email VARCHAR(255),
    phone VARCHAR(20),
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Orders (البيانات)
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    employee_name VARCHAR(255) NOT NULL,
    order_code VARCHAR(100) NOT NULL UNIQUE,
    customer_phone VARCHAR(20) NOT NULL,
    representative_phone VARCHAR(20),
    product_name VARCHAR(500),
    price DECIMAL(10, 2),
    store_name VARCHAR(255),
    admin_note TEXT,
    call_attempts INT DEFAULT 0,
    customer_status VARCHAR(100),
    more_than_five_attempts BOOLEAN DEFAULT FALSE,
    customer_note TEXT,
    shipment_status VARCHAR(255),
    representative_note TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    return_status VARCHAR(100),
    store_manager_report VARCHAR(100),
    store_manager_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: Archived Orders (الأرشيف)
CREATE TABLE IF NOT EXISTS archived_orders (
    id BIGSERIAL PRIMARY KEY,
    employee_name VARCHAR(255) NOT NULL,
    order_code VARCHAR(100) NOT NULL UNIQUE,
    customer_phone VARCHAR(20) NOT NULL,
    representative_phone VARCHAR(20),
    product_name VARCHAR(500),
    price DECIMAL(10, 2),
    store_name VARCHAR(255),
    admin_note TEXT,
    call_attempts INT DEFAULT 0,
    customer_status VARCHAR(100),
    more_than_five_attempts BOOLEAN DEFAULT FALSE,
    customer_note TEXT,
    shipment_status VARCHAR(255),
    representative_note TEXT,
    order_date TIMESTAMP,
    return_status VARCHAR(100),
    store_manager_report VARCHAR(100),
    store_manager_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 4: Distribution / Draft Orders (الموزع)
CREATE TABLE IF NOT EXISTS distribution_orders (
    id BIGSERIAL PRIMARY KEY,
    employee_name VARCHAR(255) NOT NULL,
    order_code VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    representative_phone VARCHAR(20),
    product_name VARCHAR(500),
    price DECIMAL(10, 2),
    store_name VARCHAR(255),
    admin_note TEXT,
    call_attempts INT DEFAULT 0,
    customer_status VARCHAR(100),
    more_than_five_attempts BOOLEAN DEFAULT FALSE,
    customer_note TEXT,
    shipment_status VARCHAR(255),
    representative_note TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    return_status VARCHAR(100),
    store_manager_report VARCHAR(100),
    store_manager_note TEXT,
    admin_update VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_employee_name ON orders(employee_name);
CREATE INDEX IF NOT EXISTS idx_orders_store_name ON orders(store_name);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_code ON orders(order_code);
CREATE INDEX IF NOT EXISTS idx_orders_customer_status ON orders(customer_status);
CREATE INDEX IF NOT EXISTS idx_orders_shipment_status ON orders(shipment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_archived_orders_employee_name ON archived_orders(employee_name);
CREATE INDEX IF NOT EXISTS idx_archived_orders_order_code ON archived_orders(order_code);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insert sample admin user
INSERT INTO users (username, password, role, email, phone, date_added)
VALUES ('admin', '123456', 'admin', 'admin@calling-system.local', '+218123456789', CURRENT_TIMESTAMP)
ON CONFLICT (username) DO NOTHING;

-- Insert sample employee user
INSERT INTO users (username, password, role, email, phone, date_added)
VALUES ('جنة', 'password', 'employee', 'jane@calling-system.local', '+218987654321', CURRENT_TIMESTAMP)
ON CONFLICT (username) DO NOTHING;

-- Insert sample store user
INSERT INTO users (username, password, role, available_stores, email, phone, date_added)
VALUES ('المتجر', 'storepass', 'store', 'متجر-1', 'store@calling-system.local', '+218555555555', CURRENT_TIMESTAMP)
ON CONFLICT (username) DO NOTHING;
