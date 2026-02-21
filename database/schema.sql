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
