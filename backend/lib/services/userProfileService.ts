import type { AuthUser } from '../authStore';
import { getAuthUserById, updateAuthUserProfile } from './authService';
import { logPlatformEvent } from '../eventLogger';

export interface UserProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  userType: AuthUser['userType'];
  businessName?: string;
  licenseNumber?: string;
  serviceAreas?: string[];
  specialties?: string[];
  subscription?: {
    status: 'trial' | 'active' | 'canceled';
    trialEndsAt?: string;
    daysRemaining?: number;
    plan: string;
    price: number;
  } | null;
  createdAt: string;
  updatedAt?: string;
}

function mapUserToProfile(user: AuthUser): UserProfileResponse {
  const daysRemaining = user.subscription?.trialEndsAt
    ? Math.max(
        0,
        Math.ceil((new Date(user.subscription.trialEndsAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      )
    : undefined;

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    state: user.state || '',
    zipCode: user.zipCode || '',
    userType: user.userType,
    businessName: user.businessName,
    licenseNumber: user.licenseNumber,
    serviceAreas: user.serviceAreas,
    specialties: user.specialties,
    subscription: user.subscription
      ? {
          ...user.subscription,
          daysRemaining,
        }
      : null,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function getUserProfile(userId: string): Promise<UserProfileResponse | null> {
  const user = await getAuthUserById(userId);
  if (user) {
    return mapUserToProfile(user);
  }

  return null;
}

export async function updateUserProfile(profileData: Record<string, unknown>): Promise<UserProfileResponse | null> {
  const userId = typeof profileData.userId === 'string' ? profileData.userId : '';
  const existingUser = userId ? await getAuthUserById(userId) : null;

  if (existingUser) {
    const updatedUser = await updateAuthUserProfile(existingUser.id, {
      firstName: typeof profileData.firstName === 'string' ? profileData.firstName : existingUser.firstName,
      lastName: typeof profileData.lastName === 'string' ? profileData.lastName : existingUser.lastName,
      phone: typeof profileData.phone === 'string' ? profileData.phone : existingUser.phone,
      address: typeof profileData.address === 'string' ? profileData.address : existingUser.address,
      city: typeof profileData.city === 'string' ? profileData.city : existingUser.city,
      state: typeof profileData.state === 'string' ? profileData.state : existingUser.state,
      zipCode: typeof profileData.zipCode === 'string' ? profileData.zipCode : existingUser.zipCode,
      businessName: typeof profileData.businessName === 'string' ? profileData.businessName : existingUser.businessName,
      licenseNumber: typeof profileData.licenseNumber === 'string' ? profileData.licenseNumber : existingUser.licenseNumber,
      serviceAreas: Array.isArray(profileData.serviceAreas)
        ? profileData.serviceAreas.filter((item): item is string => typeof item === 'string')
        : existingUser.serviceAreas,
      specialties: Array.isArray(profileData.specialties)
        ? profileData.specialties.filter((item): item is string => typeof item === 'string')
        : existingUser.specialties,
    });

    if (!updatedUser) {
      throw new Error('Failed to update user profile');
    }

    const updatedProfile = {
      ...mapUserToProfile(updatedUser),
      updatedAt: new Date().toISOString(),
    };

    logPlatformEvent({
      type: 'user_profile_updated',
      entityType: 'user',
      entityId: updatedUser.id,
      metadata: {
        userType: updatedUser.userType,
        hasBusinessName: Boolean(updatedUser.businessName),
        serviceAreaCount: updatedUser.serviceAreas?.length || 0,
      },
    });

    return updatedProfile;
  }

  return null;
}
