export const AUTH_TOKEN_KEY = 'buildvault.authToken';
export const AUTH_USER_KEY = 'buildvault.user';

export type WebUserType =
  | 'homeowner'
  | 'employment_seeker'
  | 'contractor'
  | 'supplier'
  | 'commercial_builder'
  | 'multi_family_owner'
  | 'apartment_owner'
  | 'developer'
  | 'landscaper'
  | 'school';

export type AuthUser = {
  id: string;
  email: string;
  userType: WebUserType;
  firstName: string;
  lastName: string;
};

const storageAvailable = typeof window !== 'undefined';

const getLocalStorage = () => {
  if (!storageAvailable) return null;
  return window.localStorage;
};

const getSessionStorage = () => {
  if (!storageAvailable) return null;
  return window.sessionStorage;
};

export function saveAuthSession(token: string, user: AuthUser, keepSignedIn = true) {
  const local = getLocalStorage();
  const session = getSessionStorage();

  local?.removeItem(AUTH_TOKEN_KEY);
  local?.removeItem(AUTH_USER_KEY);
  session?.removeItem(AUTH_TOKEN_KEY);
  session?.removeItem(AUTH_USER_KEY);

  const storage = keepSignedIn ? local : session;
  storage?.setItem(AUTH_TOKEN_KEY, token);
  storage?.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getAuthToken() {
  const local = getLocalStorage();
  const session = getSessionStorage();
  return local?.getItem(AUTH_TOKEN_KEY) || session?.getItem(AUTH_TOKEN_KEY) || null;
}

export function getAuthUser(): AuthUser | null {
  const local = getLocalStorage();
  const session = getSessionStorage();
  const rawUser = local?.getItem(AUTH_USER_KEY) || session?.getItem(AUTH_USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function clearAuthSession() {
  const local = getLocalStorage();
  const session = getSessionStorage();

  local?.removeItem(AUTH_TOKEN_KEY);
  local?.removeItem(AUTH_USER_KEY);
  session?.removeItem(AUTH_TOKEN_KEY);
  session?.removeItem(AUTH_USER_KEY);
}
