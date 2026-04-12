import { promises as fs } from 'fs';
import path from 'path';
import { dbQuery, isDatabaseEnabled } from '../db';

export const runtime = 'nodejs';

type SubscriptionRecord = {
  status: string;
  trialEndsAt?: string;
  discountEndsAt?: string;
  daysRemaining?: number;
  plan: string;
  price: number;
  standardPrice?: number;
};

export type StoredUser = {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  userType: string;
  businessName?: string;
  licenseNumber?: string;
  serviceAreas?: string[];
  specialties?: string[];
  supplierCategories?: string[];
  supplierAudience?: string[];
  supplierVisibilityRestricted?: boolean;
  supplierDescription?: string;
  supplierSpecialServices?: string[];
  customOrderMaterials?: string[];
  catalogSheetUrls?: string[];
  leadTimeDetails?: string;
  minimumOrderQuantities?: string;
  fabricationCapabilities?: string;
  subscription?: SubscriptionRecord | null;
  createdAt: string;
  updatedAt?: string;
  verified: boolean;
  verifiedAt?: string;
};

type VerificationTokenRecord = {
  userId: string;
  email: string;
  expiresAt: number;
};

type PasswordResetTokenRecord = {
  email: string;
  expiresAt: number;
};

type AuthStoreState = {
  usersByEmail: Record<string, StoredUser>;
  verificationTokens: Record<string, VerificationTokenRecord>;
  passwordResetTokens: Record<string, PasswordResetTokenRecord>;
};

const DEFAULT_PASSWORD_HASH = '$2b$10$va81FM4dFOOJ5YogHp92b.UmdbTOh7TOuRCNZ8wy4ZzwiqIDox1Dq';
const STORE_FILE_PATH =
  process.env.AUTH_STORE_FILE_PATH ||
  (process.env.VERCEL
    ? '/tmp/.data/auth-store.json'
    : path.join(/* turbopackIgnore: true */ process.cwd(), '.data', 'auth-store.json'));

const seededUsers: StoredUser[] = [
  {
    id: 'user_1',
    email: 'contractor@test.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    firstName: 'John',
    lastName: 'Builder',
    phone: '555-0123',
    address: '500 Contractor Way',
    city: 'Austin',
    state: 'TX',
    zipCode: '78702',
    userType: 'contractor',
    businessName: 'ABC Construction LLC',
    licenseNumber: 'C-12345678',
    serviceAreas: ['78701', '78702', '78703'],
    specialties: ['Remodeling', 'General Contracting', 'New Construction'],
    subscription: {
      status: 'trial',
      trialEndsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 20,
      plan: 'contractor_pro',
      price: 49.99,
    },
    createdAt: new Date('2024-01-01').toISOString(),
    verified: true,
    verifiedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'user_2',
    email: 'homeowner@test.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '555-0124',
    address: '123 Main St',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    userType: 'homeowner',
    createdAt: new Date('2024-01-02').toISOString(),
    verified: true,
    verifiedAt: new Date('2024-01-02').toISOString(),
  },
  {
    id: 'user_3',
    email: 'employment@test.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    firstName: 'Evan',
    lastName: 'Apprentice',
    phone: '555-0125',
    address: '77 Job Trail',
    city: 'Austin',
    state: 'TX',
    zipCode: '78704',
    userType: 'employment_seeker',
    createdAt: new Date('2024-01-03').toISOString(),
    verified: true,
    verifiedAt: new Date('2024-01-03').toISOString(),
  },
  {
    id: 'user_4',
    email: 'commercialbuilder@test.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    firstName: 'Casey',
    lastName: 'Commercial',
    phone: '555-0126',
    address: '900 Tower Blvd',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
    userType: 'commercial_builder',
    subscription: {
      status: 'trial',
      trialEndsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 20,
      plan: 'commercial_pro',
      price: 99.99,
    },
    createdAt: new Date('2024-01-04').toISOString(),
    verified: true,
    verifiedAt: new Date('2024-01-04').toISOString(),
  },
  {
    id: 'user_5',
    email: 'multifamily@test.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    firstName: 'Morgan',
    lastName: 'Portfolio',
    phone: '555-0127',
    address: '450 Portfolio Ln',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '85004',
    userType: 'multi_family_owner',
    subscription: {
      status: 'trial',
      trialEndsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 20,
      plan: 'commercial_pro',
      price: 99.99,
    },
    createdAt: new Date('2024-01-05').toISOString(),
    verified: true,
    verifiedAt: new Date('2024-01-05').toISOString(),
  },
  {
    id: 'user_6',
    email: 'apartmentowner@test.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    firstName: 'Alex',
    lastName: 'Apartment',
    phone: '555-0128',
    address: '1800 Market St',
    city: 'Atlanta',
    state: 'GA',
    zipCode: '30303',
    userType: 'apartment_owner',
    subscription: {
      status: 'trial',
      trialEndsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 20,
      plan: 'commercial_pro',
      price: 99.99,
    },
    createdAt: new Date('2024-01-06').toISOString(),
    verified: true,
    verifiedAt: new Date('2024-01-06').toISOString(),
  },
  {
    id: 'user_7',
    email: 'developer@test.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    firstName: 'Devon',
    lastName: 'Developer',
    phone: '555-0129',
    address: '1 Capital Square',
    city: 'Nashville',
    state: 'TN',
    zipCode: '37203',
    userType: 'developer',
    subscription: {
      status: 'trial',
      trialEndsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 20,
      plan: 'commercial_pro',
      price: 99.99,
    },
    createdAt: new Date('2024-01-07').toISOString(),
    verified: true,
    verifiedAt: new Date('2024-01-07').toISOString(),
  },
  {
    id: 'user_8',
    email: 'landscaper@test.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    firstName: 'Lee',
    lastName: 'Landscaper',
    phone: '555-0130',
    address: '90 Greenway Ave',
    city: 'Sacramento',
    state: 'CA',
    zipCode: '95814',
    userType: 'landscaper',
    subscription: {
      status: 'trial',
      trialEndsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 20,
      plan: 'landscaper_pro',
      price: 49.99,
    },
    createdAt: new Date('2024-01-08').toISOString(),
    verified: true,
    verifiedAt: new Date('2024-01-08').toISOString(),
  },
  {
    id: 'user_9',
    email: 'school@test.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    firstName: 'Taylor',
    lastName: 'School',
    phone: '555-0131',
    address: '1200 Industrial Way',
    city: 'Bakersfield',
    state: 'CA',
    zipCode: '93301',
    userType: 'school',
    subscription: {
      status: 'trial',
      trialEndsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      daysRemaining: 20,
      plan: 'school_pro',
      price: 49.99,
    },
    createdAt: new Date('2024-01-09').toISOString(),
    verified: true,
    verifiedAt: new Date('2024-01-09').toISOString(),
  },
  {
    id: 'user_10',
    email: 'supplier@test.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    firstName: 'Sam',
    lastName: 'Supplier',
    phone: '555-0132',
    address: '75 Supply Park',
    city: 'Houston',
    state: 'TX',
    zipCode: '77002',
    userType: 'supplier',
    businessName: 'BuildSource Supply Co.',
    serviceAreas: ['Houston Metro', 'Austin', 'San Antonio'],
    supplierCategories: ['Lumber', 'Concrete', 'Fasteners', 'Site Materials'],
    supplierAudience: ['contractor', 'commercial_builder', 'developer', 'landscaper', 'homeowner'],
    supplierVisibilityRestricted: true,
    supplierDescription: 'Regional construction materials supplier with contractor pricing and jobsite delivery.',
    supplierSpecialServices: ['Jobsite delivery', 'Takeoff assistance', 'Rush-order sourcing'],
    customOrderMaterials: ['Custom truss packages', 'Special-order stone veneer'],
    catalogSheetUrls: ['https://example.com/buildsource-catalog.pdf'],
    leadTimeDetails: 'Standard materials 1-3 days, special orders 2-4 weeks depending on mill lead times.',
    minimumOrderQuantities: 'Bulk stone and fabricated steel require minimum order quantities by item class.',
    fabricationCapabilities: 'Cut-to-length, basic steel prep, and prefab package coordination available.',
    subscription: {
      status: 'active',
      plan: 'free',
      price: 0,
    },
    createdAt: new Date('2024-01-10').toISOString(),
    verified: true,
    verifiedAt: new Date('2024-01-10').toISOString(),
  },
];

const seededState: AuthStoreState = {
  usersByEmail: Object.fromEntries(seededUsers.map((user) => [user.email, user])),
  verificationTokens: {},
  passwordResetTokens: {},
};

declare global {
  var __buildvaultAuthStoreState: AuthStoreState | undefined;
  var __buildvaultAuthStoreLoadPromise: Promise<AuthStoreState> | undefined;
  var __buildvaultAuthStoreWritePromise: Promise<void> | undefined;
}

async function ensureStoreDir() {
  await fs.mkdir(path.dirname(STORE_FILE_PATH), { recursive: true });
}

async function writeStore(state: AuthStoreState) {
  await ensureStoreDir();
  await fs.writeFile(STORE_FILE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

async function loadStoreFromDisk(): Promise<AuthStoreState> {
  try {
    const raw = await fs.readFile(STORE_FILE_PATH, 'utf8');
    return JSON.parse(raw) as AuthStoreState;
  } catch (error) {
    const missingFile = error instanceof Error && 'code' in error && error.code === 'ENOENT';
    if (!missingFile) {
      console.error('Failed to read auth store, reseeding defaults:', error);
    }
    await writeStore(seededState);
    return structuredClone(seededState);
  }
}

async function getState(): Promise<AuthStoreState> {
  if (globalThis.__buildvaultAuthStoreState) {
    return globalThis.__buildvaultAuthStoreState;
  }

  if (!globalThis.__buildvaultAuthStoreLoadPromise) {
    globalThis.__buildvaultAuthStoreLoadPromise = loadStoreFromDisk().then((state) => {
      globalThis.__buildvaultAuthStoreState = state;
      return state;
    });
  }

  return globalThis.__buildvaultAuthStoreLoadPromise;
}

async function persistState(state: AuthStoreState) {
  globalThis.__buildvaultAuthStoreState = state;
  const previousWrite = globalThis.__buildvaultAuthStoreWritePromise || Promise.resolve();
  globalThis.__buildvaultAuthStoreWritePromise = previousWrite.then(() => writeStore(state));
  await globalThis.__buildvaultAuthStoreWritePromise;
}

function getDaysRemaining(endsAt?: string) {
  if (!endsAt) return undefined;
  const diffMs = new Date(endsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
}

function buildPublicProfile(user: StoredUser) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    address: user.address,
    city: user.city,
    state: user.state,
    zipCode: user.zipCode,
    userType: user.userType,
    businessName: user.businessName,
    licenseNumber: user.licenseNumber,
    serviceAreas: user.serviceAreas,
    specialties: user.specialties,
    supplierCategories: user.supplierCategories,
    supplierAudience: user.supplierAudience,
    supplierVisibilityRestricted: user.supplierVisibilityRestricted,
    supplierDescription: user.supplierDescription,
    supplierSpecialServices: user.supplierSpecialServices,
    customOrderMaterials: user.customOrderMaterials,
    catalogSheetUrls: user.catalogSheetUrls,
    leadTimeDetails: user.leadTimeDetails,
    minimumOrderQuantities: user.minimumOrderQuantities,
    fabricationCapabilities: user.fabricationCapabilities,
    subscription: user.subscription
      ? {
          ...user.subscription,
          daysRemaining: getDaysRemaining(user.subscription.discountEndsAt || user.subscription.trialEndsAt),
        }
      : undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    verified: user.verified,
    verifiedAt: user.verifiedAt,
  };
}

// ============================================================
// PostgreSQL implementations (used when DATABASE_URL is set)
// ============================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToStoredUser(row: Record<string, any>): StoredUser {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    zipCode: row.zip_code ?? undefined,
    userType: row.user_type,
    businessName: row.business_name ?? undefined,
    licenseNumber: row.license_number ?? undefined,
    serviceAreas: row.service_areas ?? undefined,
    specialties: row.specialties ?? undefined,
    supplierCategories: row.supplier_categories ?? undefined,
    supplierAudience: row.supplier_audience ?? undefined,
    supplierVisibilityRestricted: row.supplier_visibility_restricted ?? undefined,
    supplierDescription: row.supplier_description ?? undefined,
    supplierSpecialServices: row.supplier_special_services ?? undefined,
    customOrderMaterials: row.custom_order_materials ?? undefined,
    catalogSheetUrls: row.catalog_sheet_urls ?? undefined,
    leadTimeDetails: row.lead_time_details ?? undefined,
    minimumOrderQuantities: row.minimum_order_quantities ?? undefined,
    fabricationCapabilities: row.fabrication_capabilities ?? undefined,
    subscription: row.subscription ?? undefined,
    verified: row.verified,
    verifiedAt: row.verified_at ? new Date(row.verified_at).toISOString() : undefined,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
}

async function dbFindUserByEmail(email: string): Promise<StoredUser | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await dbQuery<Record<string, any>>('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  return rows[0] ? rowToStoredUser(rows[0]) : null;
}

async function dbFindUserById(userId: string): Promise<StoredUser | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await dbQuery<Record<string, any>>('SELECT * FROM users WHERE id = $1', [userId]);
  return rows[0] ? rowToStoredUser(rows[0]) : null;
}

async function dbCreateUser(user: StoredUser): Promise<StoredUser> {
  const existing = await dbFindUserByEmail(user.email);
  if (existing) throw new Error('User with this email already exists');

  await dbQuery(
    `INSERT INTO users (
       id, email, password_hash, first_name, last_name, phone, address, city, state, zip_code,
       user_type, business_name, license_number, service_areas, specialties,
       supplier_categories, supplier_audience, supplier_visibility_restricted,
       supplier_description, supplier_special_services, custom_order_materials, catalog_sheet_urls,
       lead_time_details, minimum_order_quantities, fabrication_capabilities,
       subscription, verified, verified_at, created_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
       $11, $12, $13, $14, $15,
       $16, $17, $18,
       $19, $20, $21, $22,
       $23, $24, $25,
       $26, $27, $28, $29
     )`,
    [
      user.id,
      user.email.toLowerCase(),
      user.passwordHash,
      user.firstName,
      user.lastName,
      user.phone ?? null,
      user.address ?? null,
      user.city ?? null,
      user.state ?? null,
      user.zipCode ?? null,
      user.userType,
      user.businessName ?? null,
      user.licenseNumber ?? null,
      user.serviceAreas ?? null,
      user.specialties ?? null,
      user.supplierCategories ?? null,
      user.supplierAudience ?? null,
      user.supplierVisibilityRestricted ?? false,
      user.supplierDescription ?? null,
      user.supplierSpecialServices ?? null,
      user.customOrderMaterials ?? null,
      user.catalogSheetUrls ?? null,
      user.leadTimeDetails ?? null,
      user.minimumOrderQuantities ?? null,
      user.fabricationCapabilities ?? null,
      user.subscription ? JSON.stringify(user.subscription) : null,
      user.verified,
      user.verifiedAt ? new Date(user.verifiedAt) : null,
      new Date(user.createdAt),
    ]
  );

  return (await dbFindUserByEmail(user.email))!;
}

async function dbUpdateUserByEmail(email: string, updates: Partial<StoredUser>): Promise<StoredUser | null> {
  const fieldMap: Record<string, string> = {
    passwordHash: 'password_hash',
    firstName: 'first_name',
    lastName: 'last_name',
    phone: 'phone',
    address: 'address',
    city: 'city',
    state: 'state',
    zipCode: 'zip_code',
    userType: 'user_type',
    businessName: 'business_name',
    licenseNumber: 'license_number',
    serviceAreas: 'service_areas',
    specialties: 'specialties',
    supplierCategories: 'supplier_categories',
    supplierAudience: 'supplier_audience',
    supplierVisibilityRestricted: 'supplier_visibility_restricted',
    supplierDescription: 'supplier_description',
    supplierSpecialServices: 'supplier_special_services',
    customOrderMaterials: 'custom_order_materials',
    catalogSheetUrls: 'catalog_sheet_urls',
    leadTimeDetails: 'lead_time_details',
    minimumOrderQuantities: 'minimum_order_quantities',
    fabricationCapabilities: 'fabrication_capabilities',
    subscription: 'subscription',
    verified: 'verified',
    verifiedAt: 'verified_at',
  };

  const setClauses: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 1;

  for (const [key, value] of Object.entries(updates)) {
    const col = fieldMap[key];
    if (!col || value === undefined) continue;

    setClauses.push(`${col} = $${paramIdx++}`);

    if (key === 'subscription') {
      params.push(value !== null ? JSON.stringify(value) : null);
    } else if (key === 'verifiedAt') {
      params.push(value ? new Date(value as string) : null);
    } else {
      params.push(value);
    }
  }

  if (setClauses.length === 0) return dbFindUserByEmail(email);

  setClauses.push(`updated_at = NOW()`);
  params.push(email.toLowerCase());

  await dbQuery(`UPDATE users SET ${setClauses.join(', ')} WHERE email = $${paramIdx}`, params);
  return dbFindUserByEmail(email);
}

async function dbUpdateUserById(userId: string, updates: Partial<StoredUser>): Promise<StoredUser | null> {
  const user = await dbFindUserById(userId);
  if (!user) return null;
  return dbUpdateUserByEmail(user.email, updates);
}

async function dbCreateVerificationToken(token: string, data: VerificationTokenRecord): Promise<void> {
  await dbQuery(
    `INSERT INTO verification_tokens (token, user_id, email, expires_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (token) DO UPDATE SET user_id = $2, email = $3, expires_at = $4`,
    [token, data.userId, data.email, data.expiresAt]
  );
}

async function dbGetVerificationToken(token: string): Promise<VerificationTokenRecord | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await dbQuery<Record<string, any>>('SELECT * FROM verification_tokens WHERE token = $1', [token]);
  if (!rows[0]) return null;
  return { userId: rows[0].user_id, email: rows[0].email, expiresAt: Number(rows[0].expires_at) };
}

async function dbDeleteVerificationToken(token: string): Promise<void> {
  await dbQuery('DELETE FROM verification_tokens WHERE token = $1', [token]);
}

async function dbCreatePasswordResetToken(token: string, data: PasswordResetTokenRecord): Promise<void> {
  await dbQuery(
    `INSERT INTO password_reset_tokens (token, email, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (token) DO UPDATE SET email = $2, expires_at = $3`,
    [token, data.email, data.expiresAt]
  );
}

async function dbGetPasswordResetToken(token: string): Promise<PasswordResetTokenRecord | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await dbQuery<Record<string, any>>('SELECT * FROM password_reset_tokens WHERE token = $1', [token]);
  if (!rows[0]) return null;
  return { email: rows[0].email, expiresAt: Number(rows[0].expires_at) };
}

async function dbDeletePasswordResetToken(token: string): Promise<void> {
  await dbQuery('DELETE FROM password_reset_tokens WHERE token = $1', [token]);
}

async function dbGetVisibleSuppliersForViewer(viewerType: string) {
  const rows = await dbQuery<Record<string, any>>(
    `SELECT * FROM users
     WHERE user_type = 'supplier'
       AND (supplier_visibility_restricted = false OR $1 = ANY(supplier_audience))`,
    [viewerType]
  );
  return rows.map(rowToStoredUser).map((user) => ({
    id: user.id,
    businessName: user.businessName || `${user.firstName} ${user.lastName}`.trim(),
    supplierDescription: user.supplierDescription,
    city: user.city,
    state: user.state,
    phone: user.phone,
    email: user.email,
    supplierCategories: user.supplierCategories || [],
    serviceAreas: user.serviceAreas || [],
    supplierSpecialServices: user.supplierSpecialServices || [],
    customOrderMaterials: user.customOrderMaterials || [],
    catalogSheetUrls: user.catalogSheetUrls || [],
    leadTimeDetails: user.leadTimeDetails,
    minimumOrderQuantities: user.minimumOrderQuantities,
    fabricationCapabilities: user.fabricationCapabilities,
    supplierVisibilityRestricted: user.supplierVisibilityRestricted,
    supplierAudience: (user.supplierAudience || []) as Array<
      | 'homeowner' | 'employment_seeker' | 'contractor' | 'supplier'
      | 'commercial_builder' | 'multi_family_owner' | 'apartment_owner'
      | 'developer' | 'landscaper' | 'school'
    >,
  }));
}

// ============================================================
// File-based store (used for local dev without DATABASE_URL)
// ============================================================

export async function findUserByEmail(email: string) {
  if (isDatabaseEnabled()) return dbFindUserByEmail(email);
  const state = await getState();
  return state.usersByEmail[email.toLowerCase()] || null;
}

export async function findUserById(userId: string) {
  if (isDatabaseEnabled()) return dbFindUserById(userId);
  const state = await getState();
  return Object.values(state.usersByEmail).find((user) => user.id === userId) || null;
}

export async function createUser(user: StoredUser) {
  if (isDatabaseEnabled()) return dbCreateUser(user);
  const state = await getState();
  const emailKey = user.email.toLowerCase();
  if (state.usersByEmail[emailKey]) {
    throw new Error('User with this email already exists');
  }

  const nextState: AuthStoreState = {
    ...state,
    usersByEmail: {
      ...state.usersByEmail,
      [emailKey]: { ...user, email: emailKey },
    },
  };

  await persistState(nextState);
  return nextState.usersByEmail[emailKey];
}

export async function updateUserByEmail(email: string, updates: Partial<StoredUser>) {
  if (isDatabaseEnabled()) return dbUpdateUserByEmail(email, updates);
  const state = await getState();
  const emailKey = email.toLowerCase();
  const existing = state.usersByEmail[emailKey];
  if (!existing) {
    return null;
  }

  const updatedUser: StoredUser = {
    ...existing,
    ...updates,
    email: emailKey,
    updatedAt: new Date().toISOString(),
  };

  const nextState: AuthStoreState = {
    ...state,
    usersByEmail: {
      ...state.usersByEmail,
      [emailKey]: updatedUser,
    },
  };

  await persistState(nextState);
  return updatedUser;
}

export async function updateUserById(userId: string, updates: Partial<StoredUser>) {
  if (isDatabaseEnabled()) return dbUpdateUserById(userId, updates);
  const user = await findUserById(userId);
  if (!user) {
    return null;
  }

  return updateUserByEmail(user.email, updates);
}

export async function createVerificationToken(token: string, tokenData: VerificationTokenRecord) {
  if (isDatabaseEnabled()) return dbCreateVerificationToken(token, tokenData);
  const state = await getState();
  const nextState: AuthStoreState = {
    ...state,
    verificationTokens: {
      ...state.verificationTokens,
      [token]: tokenData,
    },
  };
  await persistState(nextState);
}

export async function getVerificationToken(token: string) {
  if (isDatabaseEnabled()) return dbGetVerificationToken(token);
  const state = await getState();
  return state.verificationTokens[token] || null;
}

export async function deleteVerificationToken(token: string) {
  if (isDatabaseEnabled()) return dbDeleteVerificationToken(token);
  const state = await getState();
  if (!state.verificationTokens[token]) return;
  const nextTokens = { ...state.verificationTokens };
  delete nextTokens[token];
  await persistState({
    ...state,
    verificationTokens: nextTokens,
  });
}

export async function createPasswordResetToken(token: string, tokenData: PasswordResetTokenRecord) {
  if (isDatabaseEnabled()) return dbCreatePasswordResetToken(token, tokenData);
  const state = await getState();
  const nextState: AuthStoreState = {
    ...state,
    passwordResetTokens: {
      ...state.passwordResetTokens,
      [token]: tokenData,
    },
  };
  await persistState(nextState);
}

export async function getPasswordResetToken(token: string) {
  if (isDatabaseEnabled()) return dbGetPasswordResetToken(token);
  const state = await getState();
  return state.passwordResetTokens[token] || null;
}

export async function deletePasswordResetToken(token: string) {
  if (isDatabaseEnabled()) return dbDeletePasswordResetToken(token);
  const state = await getState();
  if (!state.passwordResetTokens[token]) return;
  const nextTokens = { ...state.passwordResetTokens };
  delete nextTokens[token];
  await persistState({
    ...state,
    passwordResetTokens: nextTokens,
  });
}

export async function getPublicProfileByUserId(userId: string) {
  const user = await findUserById(userId);
  return user ? buildPublicProfile(user) : null;
}

function parseStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return undefined;
}

export async function updatePublicProfile(
  profileData: Partial<StoredUser> & {
    id?: string;
    serviceAreas?: unknown;
    specialties?: unknown;
    supplierCategories?: unknown;
    supplierAudience?: unknown;
    supplierSpecialServices?: unknown;
    customOrderMaterials?: unknown;
    catalogSheetUrls?: unknown;
  }
) {
  if (!profileData.id) {
    throw new Error('User ID is required');
  }

  const updates: Partial<StoredUser> = {
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    phone: profileData.phone,
    address: profileData.address,
    city: profileData.city,
    state: profileData.state,
    zipCode: profileData.zipCode,
    userType: profileData.userType,
    businessName: profileData.businessName,
    licenseNumber: profileData.licenseNumber,
    serviceAreas: parseStringArray(profileData.serviceAreas),
    specialties: parseStringArray(profileData.specialties),
    supplierCategories: parseStringArray(profileData.supplierCategories),
    supplierAudience: parseStringArray(profileData.supplierAudience),
    supplierVisibilityRestricted: profileData.supplierVisibilityRestricted,
    supplierDescription: profileData.supplierDescription,
    supplierSpecialServices: parseStringArray(profileData.supplierSpecialServices),
    customOrderMaterials: parseStringArray(profileData.customOrderMaterials),
    catalogSheetUrls: parseStringArray(profileData.catalogSheetUrls),
    leadTimeDetails: profileData.leadTimeDetails,
    minimumOrderQuantities: profileData.minimumOrderQuantities,
    fabricationCapabilities: profileData.fabricationCapabilities,
  };

  const updatedUser = await updateUserById(profileData.id, updates);
  return updatedUser ? buildPublicProfile(updatedUser) : null;
}

export async function getVisibleSuppliersForViewer(viewerType: string) {
  if (isDatabaseEnabled()) return dbGetVisibleSuppliersForViewer(viewerType);
  const state = await getState();
  return Object.values(state.usersByEmail)
    .filter((user) => user.userType === 'supplier')
    .filter((user) => {
      if (!user.supplierVisibilityRestricted) return true;
      return Array.isArray(user.supplierAudience) && user.supplierAudience.includes(viewerType);
    })
    .map((user) => ({
      id: user.id,
      businessName: user.businessName || `${user.firstName} ${user.lastName}`.trim(),
      supplierDescription: user.supplierDescription,
      city: user.city,
      state: user.state,
      phone: user.phone,
      email: user.email,
      supplierCategories: user.supplierCategories || [],
      serviceAreas: user.serviceAreas || [],
      supplierSpecialServices: user.supplierSpecialServices || [],
      customOrderMaterials: user.customOrderMaterials || [],
      catalogSheetUrls: user.catalogSheetUrls || [],
      leadTimeDetails: user.leadTimeDetails,
      minimumOrderQuantities: user.minimumOrderQuantities,
      fabricationCapabilities: user.fabricationCapabilities,
      supplierVisibilityRestricted: user.supplierVisibilityRestricted,
      supplierAudience: (user.supplierAudience || []) as Array<
        'homeowner' | 'employment_seeker' | 'contractor' | 'supplier' | 'commercial_builder' | 'multi_family_owner' | 'apartment_owner' | 'developer' | 'landscaper' | 'school'
      >,
    }));
}

export function generateToken(length = 32) {
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}