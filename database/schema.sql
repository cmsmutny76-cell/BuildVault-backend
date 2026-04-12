-- BuildVault Database Schema (v2 - unified user model)
-- Run this against a fresh PostgreSQL database (e.g. Railway Postgres service)
-- Compatible with the StoredUser type in backend/lib/server/authStore.ts

-- Unified users table (covers all userTypes: homeowner, contractor, commercial_builder, etc.)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,               -- e.g. "user_1714000000000"
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(30),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    user_type VARCHAR(50) NOT NULL DEFAULT 'homeowner',
    -- Contractor / business fields
    business_name VARCHAR(255),
    license_number VARCHAR(100),
    service_areas TEXT[],
    specialties TEXT[],
    -- Supplier fields
    supplier_categories TEXT[],
    supplier_audience TEXT[],
    supplier_visibility_restricted BOOLEAN DEFAULT false,
    supplier_description TEXT,
    supplier_special_services TEXT[],
    custom_order_materials TEXT[],
    catalog_sheet_urls TEXT[],
    lead_time_details TEXT,
    minimum_order_quantities TEXT,
    fabrication_capabilities TEXT,
    -- Subscription stored as JSONB (synced from Stripe / RevenueCat)
    subscription JSONB,
    -- Auth
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS verification_tokens (
    token VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    expires_at BIGINT NOT NULL   -- Unix ms timestamp
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    expires_at BIGINT NOT NULL   -- Unix ms timestamp
);

-- Stripe subscription records (source of truth for web billing)
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(255) PRIMARY KEY,              -- Stripe subscription ID
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255),
    status VARCHAR(30) DEFAULT 'active',      -- active, past_due, cancelled, expired
    plan VARCHAR(50),
    price DECIMAL(10, 2),
    standard_price DECIMAL(10, 2),
    discount_ends_at TIMESTAMP,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project documents (AI analysis results, blueprints, building codes)
CREATE TABLE IF NOT EXISTS project_documents (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    project_id VARCHAR(255),
    title VARCHAR(500),
    document_type VARCHAR(50),   -- 'photo_analysis', 'blueprint_analysis', 'building_codes', 'material_quote'
    content TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(255) PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL,
    sender_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    recipient_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Estimates / quotes
CREATE TABLE IF NOT EXISTS estimates (
    id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255),
    homeowner_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    contractor_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2),
    status VARCHAR(30) DEFAULT 'pending',    -- pending, accepted, rejected
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project scheduler state
CREATE TABLE IF NOT EXISTS scheduler_state (
    user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    project_id VARCHAR(255),
    state_data JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_state ON users(state);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_user ON project_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_project ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_estimates_homeowner ON estimates(homeowner_id);
CREATE INDEX IF NOT EXISTS idx_estimates_contractor ON estimates(contractor_id);

-- NOTE: The old schema had separate "users" and "contractors" tables.
-- This v2 schema consolidates them into a single "users" table with a user_type column.
-- The contractors table from the original schema is intentionally removed.

-- LEGACY TABLES (kept for reference, not used by current app)
-- The following original schema tables are not yet wired to the app:
-- projects, project_photos, blueprints, building_codes, measurements, material_quotes, leads, permits
-- They can be re-added when those features are database-backed.
-- Legacy DDL intentionally omitted from executable schema to avoid conflicts.
