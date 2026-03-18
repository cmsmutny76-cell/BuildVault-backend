export type UserType = 'homeowner' | 'contractor';

export interface SubscriptionInfo {
  status: 'trial' | 'active' | 'canceled';
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan: string;
  price: number;
  introPrice?: number;
  standardPrice?: number;
  introEndsAt?: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  userType: UserType;
  businessName?: string;
  licenseNumber?: string;
  serviceAreas?: string[];
  specialties?: string[];
  subscription?: SubscriptionInfo | null;
  createdAt: Date;
  verified: boolean;
  verifiedAt?: Date;
}

export interface VerificationTokenData {
  userId: string;
  email: string;
  expiresAt: number;
}

export interface PasswordResetTokenData {
  email: string;
  expiresAt: number;
}

const DEMO_PASSWORD_HASH = '$2b$10$va81FM4dFOOJ5YogHp92b.UmdbTOh7TOuRCNZ8wy4ZzwiqIDox1Dq'; // "password123"

// Shared in-memory stores for development/testing.
export const mockUsers = new Map<string, AuthUser>([
  ['contractor@test.com', {
    id: 'user_1',
    firstName: 'John',
    lastName: 'Builder',
    email: 'contractor@test.com',
    passwordHash: DEMO_PASSWORD_HASH,
    userType: 'contractor',
    phone: '555-0123',
    createdAt: new Date('2024-01-01'),
    verified: true,
    subscription: {
      status: 'trial',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      introEndsAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      plan: 'contractor_pro_intro',
      price: 39,
      introPrice: 39,
      standardPrice: 49,
    },
  }],
  ['homeowner@test.com', {
    id: 'user_2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'homeowner@test.com',
    passwordHash: DEMO_PASSWORD_HASH,
    userType: 'homeowner',
    phone: '555-0124',
    createdAt: new Date('2024-01-02'),
    verified: true,
  }],
]);

export const verificationTokens = new Map<string, VerificationTokenData>();
export const passwordResetTokens = new Map<string, PasswordResetTokenData>();

export function generateToken(length = 32): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

export function createVerificationToken(userId: string, email: string, ttlMs = 24 * 60 * 60 * 1000): string {
  const token = generateToken();
  verificationTokens.set(token, {
    userId,
    email: email.toLowerCase(),
    expiresAt: Date.now() + ttlMs,
  });
  return token;
}

export function createPasswordResetToken(email: string, ttlMs = 60 * 60 * 1000): string {
  const token = generateToken();
  passwordResetTokens.set(token, {
    email: email.toLowerCase(),
    expiresAt: Date.now() + ttlMs,
  });
  return token;
}