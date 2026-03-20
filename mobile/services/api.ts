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

  analyzeBlueprint: async (
    blueprint: File | Blob,
    projectType: string,
    location?: { city?: string; county?: string; state?: string; zipCode?: string }
  ) => {
    const formData = new FormData();
    formData.append('blueprint', blueprint);
    formData.append('projectType', projectType);
    if (location) {
      formData.append('location', JSON.stringify(location));
    }

    return fetch(`${API_BASE_URL}/ai/analyze-blueprint`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },

  generateDescription: async (payload: {
    projectType: string;
    scope: string;
    budget?: number;
    timeline?: string;
    location?: { city?: string; state?: string; zipCode?: string };
    homeownerNotes?: string;
  }) => {
    return apiRequest('/ai/generate-description', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  matchContractors: async (criteria: {
    projectId: string;
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
    return apiRequest('/estimates', {
      method: 'POST',
      body: JSON.stringify(estimateData),
    });
  },

  getEstimates: async (projectId: string) => {
    return apiRequest(`/estimates?projectId=${projectId}`, {
      method: 'GET',
    });
  },

  generateMaterialQuote: async (payload: {
    materials: Array<{ name: string; quantity: string; unit: string }>;
    projectType?: string;
    zipCode?: string;
  }) => {
    return apiRequest('/material-quotes/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  addRevision: async (payload: {
    estimateId: string;
    projectId: string;
    updatedBy: string;
    reason: string;
    changes: Array<{ field: string; before: string | number; after: string | number }>;
  }) => {
    return apiRequest('/quotes/revisions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getRevisions: async (estimateId: string) => {
    return apiRequest(`/quotes/revisions?estimateId=${estimateId}`, {
      method: 'GET',
    });
  },

  acceptEstimate: async (estimateId: string, userId: string, projectId: string) => {
    return apiRequest('/quotes/accept', {
      method: 'POST',
      body: JSON.stringify({ estimateId, userId, projectId }),
    });
  },

  rejectEstimate: async (estimateId: string, userId: string, projectId: string) => {
    return apiRequest('/quotes/reject', {
      method: 'POST',
      body: JSON.stringify({ estimateId, userId, projectId }),
    });
  },
};

// Messaging APIs
export const messageAPI = {
  getStreamUrl: (userId: string) => `${API_BASE_URL}/messages/stream?userId=${encodeURIComponent(userId)}`,

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

  updateProfile: async (userId: string, profileData: Record<string, unknown>) => {
    return apiRequest('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify({ userId, ...profileData }),
    });
  },
};

export const contractorAPI = {
  setAvailability: async (contractorId: string, availability: 'available' | 'busy' | 'booked') => {
    return apiRequest('/contractors/availability', {
      method: 'POST',
      body: JSON.stringify({ contractorId, availability }),
    });
  },

  getAvailabilityOverrides: async () => {
    return apiRequest('/contractors/availability', {
      method: 'GET',
    });
  },
};

export const projectAPI = {
  getProjects: async () => {
    return apiRequest('/projects', {
      method: 'GET',
    });
  },

  getProject: async (projectId: string) => {
    return apiRequest(`/projects/${projectId}`, {
      method: 'GET',
    });
  },
};

export default {
  auth: authAPI,
  ai: aiAPI,
  quote: quoteAPI,
  message: messageAPI,
  user: userAPI,
  contractor: contractorAPI,
  project: projectAPI,
};
