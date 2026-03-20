// Deep linking utilities for email verification
// NOTE: Requires expo-linking to be installed
// Install with: npm install expo-linking

export interface VerificationParams {
  token: string;
  userId: string;
}

/**
 * Parse verification link and extract token and userId
 * Example URL: constructionleads://verify?token=abc123&userId=user_456
 * 
 * To enable this functionality:
 * 1. Install expo-linking: npm install expo-linking
 * 2. Uncomment the import and implementation below
 * 3. Configure deep linking in app.json
 */
export function parseVerificationLink(url: string): VerificationParams | null {
  try {
    // TODO: Uncomment when expo-linking is installed
    // import * as Linking from 'expo-linking';
    // const { queryParams } = Linking.parse(url);
    
    // Basic URL parsing fallback
    const urlObj = new URL(url);
    const token = urlObj.searchParams.get('token');
    const userId = urlObj.searchParams.get('userId');
    
    if (!token || !userId) {
      return null;
    }

    return { token, userId };
  } catch (error) {
    console.error('Failed to parse verification link:', error);
    return null;
  }
}

/**
 * Get the initial verification URL when app is opened from a link
 * Requires expo-linking to be installed
 */
export async function getInitialVerificationUrl(): Promise<string | null> {
  try {
    // TODO: Uncomment when expo-linking is installed
    // import * as Linking from 'expo-linking';
    // const initialUrl = await Linking.getInitialURL();
    // return initialUrl;
    
    console.log('Deep linking requires expo-linking to be installed');
    return null;
  } catch (error) {
    console.error('Failed to get initial URL:', error);
    return null;
  }
}

/**
 * Listen for deep links while app is running
 * Requires expo-linking to be installed
 */
export function addVerificationLinkListener(
  callback: (params: VerificationParams) => void
): { remove: () => void } {
  // TODO: Uncomment when expo-linking is installed
  // import * as Linking from 'expo-linking';
  // const subscription = Linking.addEventListener('url', (event: any) => {
  //   const params = parseVerificationLink(event.url);
  //   if (params) {
  //     callback(params);
  //   }
  // });
  // return subscription;
  
  console.log('Deep linking requires expo-linking to be installed');
  return {
    remove: () => {
      console.log('No subscription to remove');
    },
  };
}

/**
 * Check if URL is a verification link
 */
export function isVerificationLink(url: string): boolean {
  return url.includes('verify') && url.includes('token') && url.includes('userId');
}
