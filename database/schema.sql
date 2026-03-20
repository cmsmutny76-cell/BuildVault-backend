-- Construction Lead Generator Database Schema

-- Users table (homeowners)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contractors table
CREATE TABLE contractors (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    service_areas TEXT[], -- Array of service zip codes
    specialties TEXT[], -- Array of specialties (roofing, flooring, etc.)
    membership_status VARCHAR(20) DEFAULT 'inactive', -- trial, active, inactive, suspended, expired
    membership_expires_at TIMESTAMP,
    trial_started_at TIMESTAMP,
    trial_ends_at TIMESTAMP,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    contractor_id INTEGER REFERENCES contractors(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'trial', -- trial, active, past_due, cancelled, expired
    plan VARCHAR(50) DEFAULT 'contractor_pro',
    price DECIMAL(10, 2) DEFAULT 49.99,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(100), -- roofing, flooring, painting, etc.
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    status VARCHAR(20) DEFAULT 'draft', -- draft, quoted, matched, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Photos table
CREATE TABLE project_photos (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    s3_key VARCHAR(500),
    photo_type VARCHAR(20) DEFAULT 'photo', -- 'photo' or 'blueprint'
    analysis_data JSONB, -- AI analysis results
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blueprints table
CREATE TABLE blueprints (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    blueprint_url TEXT NOT NULL,
    s3_key VARCHAR(500),
    analysis_data JSONB, -- Detailed blueprint analysis
    dimensions JSONB, -- Extracted dimensions
    materials_list JSONB, -- Complete materials list
    structural_data JSONB, -- Structural specifications
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Building Codes table
CREATE TABLE building_codes (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    location_city VARCHAR(100),
    location_county VARCHAR(100),
    location_state VARCHAR(2),
    location_zip VARCHAR(10),
    code_data JSONB NOT NULL, -- Full code requirements
    required_hardware JSONB, -- Additional hardware mandated by code
    permit_requirements JSONB, -- Permit details
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP -- Code data expiration
);

-- Measurements table
CREATE TABLE measurements (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    measurement_type VARCHAR(50), -- length, width, height, area, etc.
    value DECIMAL(10, 2),
    unit VARCHAR(20), -- ft, in, sqft, etc.
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Material Quotes table
CREATE TABLE material_quotes (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    quote_data JSONB NOT NULL, -- Full quote with materials list
    total_amount DECIMAL(10, 2),
    retailer_prices JSONB, -- Prices from Home Depot, Lowes, Ace
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Leads table (connections between homeowners and contractors)
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    contractor_id INTEGER REFERENCES contractors(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, rejected, completed
    contractor_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, contractor_id)
);

-- Permits table (permit requirements by location)
CREATE TABLE permits (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    permit_type VARCHAR(100),
    jurisdiction VARCHAR(255), -- City or county
    requirements TEXT,
    estimated_cost DECIMAL(10, 2),
    estimated_approval_days INTEGER,
    application_url TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_contractors_email ON contractors(email);
CREATE INDEX idx_contractors_zip ON contractors(zip_code);
CREATE INDEX idx_contractors_status ON contractors(membership_status);
CREATE INDEX idx_contractors_stripe ON contractors(stripe_customer_id);
CREATE INDEX idx_subscriptions_contractor ON subscriptions(contractor_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_zip ON projects(zip_code);
CREATE INDEX idx_photos_project ON project_photos(project_id);
CREATE INDEX idx_photos_type ON project_photos(photo_type);
CREATE INDEX idx_blueprints_project ON blueprints(project_id);
CREATE INDEX idx_building_codes_project ON building_codes(project_id);
CREATE INDEX idx_building_codes_location ON building_codes(location_state, location_city);
CREATE INDEX idx_measurements_project ON measurements(project_id);
CREATE INDEX idx_quotes_project ON material_quotes(project_id);
CREATE INDEX idx_leads_project ON leads(project_id);
CREATE INDEX idx_leads_contractor ON leads(contractor_id);
CREATE INDEX idx_permits_project ON permits(project_id);

-- App-layer persistence tables using current string IDs from the service layer.
CREATE TABLE app_projects (
    id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL,
    project_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE app_estimates (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES app_projects(id) ON DELETE CASCADE,
    contractor_id VARCHAR(64) NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL,
    line_items JSONB NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    tax DECIMAL(12, 2) NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    notes TEXT,
    valid_until TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE app_estimate_revisions (
    id VARCHAR(64) PRIMARY KEY,
    estimate_id VARCHAR(64) REFERENCES app_estimates(id) ON DELETE CASCADE,
    project_id VARCHAR(64) REFERENCES app_projects(id) ON DELETE CASCADE,
    updated_by VARCHAR(64) NOT NULL,
    reason TEXT NOT NULL,
    changes JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE app_messages (
    id VARCHAR(64) PRIMARY KEY,
    conversation_id VARCHAR(128) NOT NULL,
    sender_id VARCHAR(64) NOT NULL,
    receiver_id VARCHAR(64) NOT NULL,
    project_id VARCHAR(64),
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE platform_events (
    id VARCHAR(80) PRIMARY KEY,
    type VARCHAR(64) NOT NULL,
    entity_type VARCHAR(32) NOT NULL,
    entity_id VARCHAR(128) NOT NULL,
    occurred_at TIMESTAMP NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_app_projects_owner ON app_projects(owner_id);
CREATE INDEX idx_app_estimates_project ON app_estimates(project_id);
CREATE INDEX idx_app_revisions_estimate ON app_estimate_revisions(estimate_id);
CREATE INDEX idx_app_messages_conversation ON app_messages(conversation_id);
CREATE INDEX idx_app_messages_receiver ON app_messages(receiver_id);
CREATE INDEX idx_platform_events_type ON platform_events(type);
CREATE INDEX idx_platform_events_entity ON platform_events(entity_type, entity_id);

CREATE TABLE app_auth_users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(32),
    zip_code VARCHAR(20),
    user_type VARCHAR(32) NOT NULL,
    business_name VARCHAR(255),
    license_number VARCHAR(100),
    service_areas JSONB,
    specialties JSONB,
    subscription JSONB,
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE app_auth_verification_tokens (
    token VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES app_auth_users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE app_auth_password_reset_tokens (
    token VARCHAR(128) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_app_auth_users_email ON app_auth_users(email);
CREATE INDEX idx_app_auth_users_type ON app_auth_users(user_type);
CREATE INDEX idx_app_auth_verify_user ON app_auth_verification_tokens(user_id);
CREATE INDEX idx_app_auth_reset_email ON app_auth_password_reset_tokens(email);

CREATE TABLE app_contractor_availability (
    contractor_id VARCHAR(64) PRIMARY KEY,
    availability VARCHAR(16) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_app_contractor_availability_status ON app_contractor_availability(availability);
