import { Pool, type QueryResultRow } from 'pg';

let pool: Pool | null = null;
let schemaInitPromise: Promise<void> | null = null;

export function isDatabaseEnabled(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured');
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  return pool;
}

async function ensureCoreSchema(): Promise<void> {
  if (schemaInitPromise) {
    return schemaInitPromise;
  }

  schemaInitPromise = (async () => {
    const p = getPool();

    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
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
        business_name VARCHAR(255),
        license_number VARCHAR(100),
        service_areas TEXT[],
        specialties TEXT[],
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
        subscription JSONB,
        verified BOOLEAN DEFAULT false,
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS verification_tokens (
        token VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        expires_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        token VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        expires_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(255) PRIMARY KEY,
        conversation_id VARCHAR(255) NOT NULL,
        sender_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
        recipient_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS estimates (
        id VARCHAR(255) PRIMARY KEY,
        project_id VARCHAR(255),
        homeowner_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
        contractor_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
        amount DECIMAL(10, 2),
        status VARCHAR(30) DEFAULT 'pending',
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_estimates_homeowner ON estimates(homeowner_id);
      CREATE INDEX IF NOT EXISTS idx_estimates_contractor ON estimates(contractor_id);
    `);
  })().catch((error) => {
    // Allow retry on next request if initialization fails.
    schemaInitPromise = null;
    throw error;
  });

  return schemaInitPromise;
}

export async function dbQuery<T extends QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  await ensureCoreSchema();
  const result = await getPool().query<T>(text, params);
  return result.rows;
}
