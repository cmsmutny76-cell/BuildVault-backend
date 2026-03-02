// API Service for Construction Lead App
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Helper function for API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

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
  
  return data;
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
    userType?: 'homeowner' | 'contractor';
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
      body: JSON.stringify({ userId, ...profileData }),
    });
  },
};

export default {
  auth: authAPI,
  ai: aiAPI,
  quote: quoteAPI,
  message: messageAPI,
  user: userAPI,
};
