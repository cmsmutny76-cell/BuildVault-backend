import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

type SubscriptionRecord = {
  status: string;
  trialEndsAt?: string;
  daysRemaining?: number;
  plan: string;
  price: number;
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

function getDaysRemaining(trialEndsAt?: string) {
  if (!trialEndsAt) return undefined;
  const diffMs = new Date(trialEndsAt).getTime() - Date.now();
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
    subscription: user.subscription
      ? {
          ...user.subscription,
          daysRemaining: getDaysRemaining(user.subscription.trialEndsAt),
        }
      : undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    verified: user.verified,
    verifiedAt: user.verifiedAt,
  };
}

export async function findUserByEmail(email: string) {
  const state = await getState();
  return state.usersByEmail[email.toLowerCase()] || null;
}

export async function findUserById(userId: string) {
  const state = await getState();
  return Object.values(state.usersByEmail).find((user) => user.id === userId) || null;
}

export async function createUser(user: StoredUser) {
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
  const user = await findUserById(userId);
  if (!user) {
    return null;
  }

  return updateUserByEmail(user.email, updates);
}

export async function createVerificationToken(token: string, tokenData: VerificationTokenRecord) {
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
  const state = await getState();
  return state.verificationTokens[token] || null;
}

export async function deleteVerificationToken(token: string) {
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
  const state = await getState();
  return state.passwordResetTokens[token] || null;
}

export async function deletePasswordResetToken(token: string) {
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
  };

  const updatedUser = await updateUserById(profileData.id, updates);
  return updatedUser ? buildPublicProfile(updatedUser) : null;
}

export function generateToken(length = 32) {
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}