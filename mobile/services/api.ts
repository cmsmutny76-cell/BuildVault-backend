// API Service for BuildVault
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
const AUTH_TOKEN_KEY = 'buildvault.authToken';

export type MobileUserType =
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

export type SupplierDirectoryEntry = {
  id: string;
  businessName: string;
  supplierDescription?: string;
  city?: string;
  state?: string;
  phone?: string;
  email: string;
  supplierCategories: string[];
  serviceAreas: string[];
  supplierAudience: MobileUserType[];
  supplierSpecialServices: string[];
  customOrderMaterials: string[];
  catalogSheetUrls: string[];
  leadTimeDetails?: string;
  minimumOrderQuantities?: string;
  fabricationCapabilities?: string;
  supplierVisibilityRestricted?: boolean;
};

export type SchedulerTaskStatus = 'not-started' | 'in-progress' | 'blocked' | 'completed';
export type SchedulerTaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type SchedulerTask = {
  id: string;
  projectId: string;
  title: string;
  phase: string;
  assignee: string;
  startDate: string;
  endDate: string;
  baselineStartDate: string;
  baselineEndDate: string;
  predecessorIds: string[];
  crewCount: number;
  equipmentUnits: number;
  status: SchedulerTaskStatus;
  progress: number;
  priority: SchedulerTaskPriority;
  isMilestone: boolean;
  notes: string;
  taskSequence?: number;
  constraintType?: 'none' | 'rfi' | 'submittal' | 'inspection' | 'materials' | 'weather' | 'other';
  constraintNote?: string;
  weatherDelayDays?: number;
  weatherCondition?: string;
  dailyLog?: string;
  lastFieldUpdateAt?: string;
};

export type SchedulerState = {
  projects: Array<{
    id: string;
    name: string;
    location: string;
    startDate: string;
    endDate: string;
  }>;
  tasks: SchedulerTask[];
};

// Helper function for API requests
async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  let token: string | null = null;
  try {
    token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    // No token available
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data as T;
}

// Authentication APIs
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    userType?: MobileUserType;
  }) => {
    return apiRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  resetPassword: async (email: string) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  confirmPasswordReset: async (token: string, newPassword: string) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
};

// AI APIs
export const aiAPI = {
  analyzePhoto: async (photo: File | Blob, projectType: string) => {
    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('projectType', projectType);

    return fetch(`${API_BASE_URL}/ai/analyze-photo`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },

  analyzeBlueprint: async (blueprint: File | Blob, projectType: string) => {
    const formData = new FormData();
    formData.append('blueprint', blueprint);
    formData.append('projectType', projectType);

    return fetch(`${API_BASE_URL}/ai/analyze-blueprint`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },

  matchContractors: async (criteria: {
    projectType: string;
    budget: number;
    location: {
      zipCode: string;
      city: string;
      state: string;
    };
    services: string[];
    timeline?: string;
    urgency?: 'low' | 'medium' | 'high';
  }) => {
    return apiRequest('/ai/match-contractors', {
      method: 'POST',
      body: JSON.stringify(criteria),
    });
  },
};

// Quote/Estimate APIs
export const quoteAPI = {
  generateEstimate: async (estimateData: {
    projectId: string;
    contractorId: string;
    projectTitle: string;
    lineItems: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      category: 'labor' | 'materials' | 'equipment' | 'permits' | 'other';
    }>;
    notes?: string;
    validDays?: number;
  }) => {
    return apiRequest('/quotes/generate', {
      method: 'POST',
      body: JSON.stringify(estimateData),
    });
  },

  getEstimates: async (projectId: string) => {
    return apiRequest(`/quotes/generate?projectId=${projectId}`, {
      method: 'GET',
    });
  },

  acceptEstimate: async (estimateId: string, userId: string, projectId: string) => {
    return apiRequest('/quotes/accept', {
      method: 'POST',
      body: JSON.stringify({ estimateId, userId, projectId }),
    });
  },
};

// Messaging APIs
export const messageAPI = {
  getConversations: async (userId: string) => {
    return apiRequest(`/messages?userId=${userId}`, {
      method: 'GET',
    });
  },

  getMessages: async (userId: string, conversationId: string) => {
    return apiRequest(`/messages?userId=${userId}&conversationId=${conversationId}`, {
      method: 'GET',
    });
  },

  sendMessage: async (messageData: {
    conversationId?: string;
    senderId: string;
    receiverId: string;
    content: string;
    projectId?: string;
    attachments?: string[];
  }) => {
    return apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  markAsRead: async (messageIds: string[], userId: string) => {
    return apiRequest('/messages', {
      method: 'PATCH',
      body: JSON.stringify({ messageIds, userId }),
    });
  },
};

// User/Profile APIs
export const userAPI = {
  getProfile: async (userId: string) => {
    return apiRequest(`/users/profile?userId=${userId}`, {
      method: 'GET',
    });
  },

  updateProfile: async (userId: string, profileData: any) => {
    return apiRequest('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify({ userId, id: userId, ...profileData }),
    });
  },
};

export const supplierAPI = {
  getSuppliers: async (viewerType: MobileUserType) => {
    return apiRequest(
      `/users/suppliers?viewerType=${encodeURIComponent(viewerType)}`,
      { method: 'GET' }
    ) as Promise<{ success: boolean; suppliers: SupplierDirectoryEntry[] }>;
  },
};

export const schedulerAPI = {
  getSchedulerState: async (userId: string) => {
    return apiRequest(
      `/scheduler?userId=${encodeURIComponent(userId)}`,
      { method: 'GET' }
    ) as Promise<{ success: boolean; state: SchedulerState }>;
  },
  saveSchedulerState: async (userId: string, state: SchedulerState) => {
    return apiRequest('/scheduler', {
      method: 'PUT',
      body: JSON.stringify({ userId, state }),
    }) as Promise<{ success: boolean; state: SchedulerState }>;
  },
};

export default {
  auth: authAPI,
  ai: aiAPI,
  quote: quoteAPI,
  message: messageAPI,
  user: userAPI,
  supplier: supplierAPI,
  scheduler: schedulerAPI,
};
