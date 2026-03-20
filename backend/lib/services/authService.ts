import {
  createPasswordResetToken as createFallbackPasswordResetToken,
  createVerificationToken as createFallbackVerificationToken,
  generateToken,
  mockUsers,
  passwordResetTokens,
  type AuthUser,
  type PasswordResetTokenData,
  type SubscriptionInfo,
  type VerificationTokenData,
  verificationTokens,
} from '../authStore';
import { dbQuery, isDatabaseEnabled } from '../db';
import { logPlatformEvent } from '../eventLogger';

interface AuthUserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  user_type: AuthUser['userType'];
  business_name: string | null;
  license_number: string | null;
  service_areas: string[] | null;
  specialties: string[] | null;
  subscription: SubscriptionInfo | null;
  verified: boolean;
  verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface VerificationTokenRow {
  token: string;
  user_id: string;
  email: string;
  expires_at: Date;
}

interface PasswordResetTokenRow {
  token: string;
  email: string;
  expires_at: Date;
}

function mapUserRow(row: AuthUserRow): AuthUser {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    passwordHash: row.password_hash,
    phone: row.phone || undefined,
    address: row.address || undefined,
    city: row.city || undefined,
    state: row.state || undefined,
    zipCode: row.zip_code || undefined,
    userType: row.user_type,
    businessName: row.business_name || undefined,
    licenseNumber: row.license_number || undefined,
    serviceAreas: row.service_areas || undefined,
    specialties: row.specialties || undefined,
    subscription: row.subscription || undefined,
    createdAt: new Date(row.created_at),
    verified: row.verified,
    verifiedAt: row.verified_at ? new Date(row.verified_at) : undefined,
  };
}

function findFallbackUserById(userId: string): AuthUser | null {
  for (const user of mockUsers.values()) {
    if (user.id === userId) {
      return user;
    }
  }
  return null;
}

export async function getAuthUserByEmail(email: string): Promise<AuthUser | null> {
  const normalizedEmail = email.toLowerCase();

  if (!isDatabaseEnabled()) {
    return mockUsers.get(normalizedEmail) || null;
  }

  const rows = await dbQuery<AuthUserRow>('SELECT * FROM app_auth_users WHERE email = $1 LIMIT 1', [normalizedEmail]);
  return rows[0] ? mapUserRow(rows[0]) : null;
}

export async function getAuthUserById(userId: string): Promise<AuthUser | null> {
  if (!isDatabaseEnabled()) {
    return findFallbackUserById(userId);
  }

  const rows = await dbQuery<AuthUserRow>('SELECT * FROM app_auth_users WHERE id = $1 LIMIT 1', [userId]);
  return rows[0] ? mapUserRow(rows[0]) : null;
}

export async function authUserExists(email: string): Promise<boolean> {
  return Boolean(await getAuthUserByEmail(email));
}

export async function createAuthUser(input: {
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
  userType: AuthUser['userType'];
  businessName?: string;
  licenseNumber?: string;
  serviceAreas?: string[];
  specialties?: string[];
  subscription?: SubscriptionInfo | null;
  verified?: boolean;
}): Promise<AuthUser> {
  const user: AuthUser = {
    id: input.id,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    phone: input.phone,
    address: input.address,
    city: input.city,
    state: input.state,
    zipCode: input.zipCode,
    userType: input.userType,
    businessName: input.businessName,
    licenseNumber: input.licenseNumber,
    serviceAreas: input.serviceAreas,
    specialties: input.specialties,
    subscription: input.subscription || null,
    createdAt: new Date(),
    verified: input.verified ?? false,
  };

  if (isDatabaseEnabled()) {
    await dbQuery(
      `INSERT INTO app_auth_users (
        id, email, password_hash, first_name, last_name, phone, address, city, state, zip_code,
        user_type, business_name, license_number, service_areas, specialties, subscription,
        verified, verified_at, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14::jsonb, $15::jsonb, $16::jsonb,
        $17, $18, $19, $20
      )`,
      [
        user.id,
        user.email,
        user.passwordHash,
        user.firstName,
        user.lastName,
        user.phone || null,
        user.address || null,
        user.city || null,
        user.state || null,
        user.zipCode || null,
        user.userType,
        user.businessName || null,
        user.licenseNumber || null,
        JSON.stringify(user.serviceAreas || []),
        JSON.stringify(user.specialties || []),
        JSON.stringify(user.subscription || null),
        user.verified,
        user.verifiedAt || null,
        user.createdAt.toISOString(),
        user.createdAt.toISOString(),
      ]
    );
  } else {
    mockUsers.set(user.email, user);
  }

  return user;
}

export async function updateAuthUserPasswordByEmail(email: string, passwordHash: string): Promise<void> {
  const normalizedEmail = email.toLowerCase();

  if (isDatabaseEnabled()) {
    await dbQuery(
      'UPDATE app_auth_users SET password_hash = $1, updated_at = $2 WHERE email = $3',
      [passwordHash, new Date().toISOString(), normalizedEmail]
    );
    return;
  }

  const user = mockUsers.get(normalizedEmail);
  if (user) {
    user.passwordHash = passwordHash;
    mockUsers.set(normalizedEmail, user);
  }
}

export async function markAuthUserVerified(userId: string): Promise<void> {
  if (isDatabaseEnabled()) {
    await dbQuery(
      'UPDATE app_auth_users SET verified = true, verified_at = $1, updated_at = $2 WHERE id = $3',
      [new Date().toISOString(), new Date().toISOString(), userId]
    );
    return;
  }

  const user = findFallbackUserById(userId);
  if (user) {
    user.verified = true;
    user.verifiedAt = new Date();
    mockUsers.set(user.email, user);
  }
}

export async function updateAuthUserProfile(userId: string, updates: Partial<AuthUser>): Promise<AuthUser | null> {
  if (isDatabaseEnabled()) {
    const existing = await getAuthUserById(userId);
    if (!existing) {
      return null;
    }

    const next: AuthUser = { ...existing, ...updates };
    await dbQuery(
      `UPDATE app_auth_users SET
        first_name = $1, last_name = $2, phone = $3, address = $4, city = $5, state = $6, zip_code = $7,
        user_type = $8, business_name = $9, license_number = $10, service_areas = $11::jsonb,
        specialties = $12::jsonb, subscription = $13::jsonb, verified = $14, verified_at = $15, updated_at = $16
       WHERE id = $17`,
      [
        next.firstName,
        next.lastName,
        next.phone || null,
        next.address || null,
        next.city || null,
        next.state || null,
        next.zipCode || null,
        next.userType,
        next.businessName || null,
        next.licenseNumber || null,
        JSON.stringify(next.serviceAreas || []),
        JSON.stringify(next.specialties || []),
        JSON.stringify(next.subscription || null),
        next.verified,
        next.verifiedAt ? next.verifiedAt.toISOString() : null,
        new Date().toISOString(),
        userId,
      ]
    );
    return next;
  }

  const existing = findFallbackUserById(userId);
  if (!existing) {
    return null;
  }

  const next: AuthUser = { ...existing, ...updates };
  mockUsers.set(next.email, next);
  return next;
}

export async function createVerificationToken(userId: string, email: string, ttlMs = 24 * 60 * 60 * 1000): Promise<string> {
  if (!isDatabaseEnabled()) {
    return createFallbackVerificationToken(userId, email, ttlMs);
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();
  await dbQuery(
    'INSERT INTO app_auth_verification_tokens (token, user_id, email, expires_at) VALUES ($1, $2, $3, $4)',
    [token, userId, email.toLowerCase(), expiresAt]
  );
  return token;
}

export async function getVerificationToken(token: string): Promise<VerificationTokenData | null> {
  if (!isDatabaseEnabled()) {
    return verificationTokens.get(token) || null;
  }

  const rows = await dbQuery<VerificationTokenRow>('SELECT * FROM app_auth_verification_tokens WHERE token = $1 LIMIT 1', [token]);
  return rows[0]
    ? {
        userId: rows[0].user_id,
        email: rows[0].email,
        expiresAt: new Date(rows[0].expires_at).getTime(),
      }
    : null;
}

export async function deleteVerificationToken(token: string): Promise<void> {
  if (!isDatabaseEnabled()) {
    verificationTokens.delete(token);
    return;
  }

  await dbQuery('DELETE FROM app_auth_verification_tokens WHERE token = $1', [token]);
}

export async function createPasswordResetToken(email: string, ttlMs = 60 * 60 * 1000): Promise<string> {
  if (!isDatabaseEnabled()) {
    return createFallbackPasswordResetToken(email, ttlMs);
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();
  await dbQuery(
    'INSERT INTO app_auth_password_reset_tokens (token, email, expires_at) VALUES ($1, $2, $3)',
    [token, email.toLowerCase(), expiresAt]
  );
  return token;
}

export async function getPasswordResetToken(token: string): Promise<PasswordResetTokenData | null> {
  if (!isDatabaseEnabled()) {
    return passwordResetTokens.get(token) || null;
  }

  const rows = await dbQuery<PasswordResetTokenRow>('SELECT * FROM app_auth_password_reset_tokens WHERE token = $1 LIMIT 1', [token]);
  return rows[0]
    ? {
        email: rows[0].email,
        expiresAt: new Date(rows[0].expires_at).getTime(),
      }
    : null;
}

export async function deletePasswordResetToken(token: string): Promise<void> {
  if (!isDatabaseEnabled()) {
    passwordResetTokens.delete(token);
    return;
  }

  await dbQuery('DELETE FROM app_auth_password_reset_tokens WHERE token = $1', [token]);
}

export function logAuthPersistenceEvent(type: 'user_registered' | 'user_verified' | 'password_reset_requested' | 'password_reset_completed', entityId: string, metadata?: Record<string, unknown>) {
  logPlatformEvent({
    type: 'user_profile_updated',
    entityType: 'user',
    entityId,
    metadata: {
      authEventType: type,
      ...metadata,
    },
  });
}
