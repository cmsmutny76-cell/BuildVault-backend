import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MobileUserType } from './api';

const AUTH_TOKEN_KEY = 'buildvault.authToken';
const AUTH_USER_KEY = 'buildvault.user';

export type StoredUser = {
  id: string;
  email: string;
  isContractor: boolean;
  userType?: MobileUserType;
  firstName?: string;
  lastName?: string;
};

export async function saveAuthSession(token: string, user: StoredUser): Promise<void> {
  await AsyncStorage.multiSet([
    [AUTH_TOKEN_KEY, token],
    [AUTH_USER_KEY, JSON.stringify(user)],
  ]);
}

export async function getAuthSession(): Promise<{ token: string; user: StoredUser } | null> {
  const results = await AsyncStorage.multiGet([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
  const token = results[0][1];
  const userRaw = results[1][1];

  if (!token || !userRaw) return null;

  try {
    const user = JSON.parse(userRaw) as StoredUser;
    return { token, user };
  } catch {
    await clearAuthSession();
    return null;
  }
}

export async function clearAuthSession(): Promise<void> {
  await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
}
