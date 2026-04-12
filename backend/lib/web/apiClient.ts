import type { AuthUser, WebUserType } from './authStorage';

type ApiError = {
  error?: string;
  success?: boolean;
};

export type HealthResponse = {
  success: boolean;
  service: string;
  timestamp: string;
};

export type LoginResponse = {
  success: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
};

export type UserProfile = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  userType?: WebUserType;
  businessName?: string;
  licenseNumber?: string;
  serviceAreas?: string[] | string;
  specialties?: string[] | string;
  supplierCategories?: string[] | string;
  supplierAudience?: WebUserType[] | string;
  supplierVisibilityRestricted?: boolean;
  supplierDescription?: string;
  supplierSpecialServices?: string[] | string;
  customOrderMaterials?: string[] | string;
  catalogSheetUrls?: string[] | string;
  leadTimeDetails?: string;
  minimumOrderQuantities?: string;
  fabricationCapabilities?: string;
  subscription?: {
    status?: string;
    trialEndsAt?: string;
    daysRemaining?: number;
    plan?: string;
    price?: number;
  };
};

export type UserProfileResponse = {
  success: boolean;
  profile?: UserProfile;
  error?: string;
};

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
  supplierAudience: WebUserType[];
  supplierSpecialServices: string[];
  customOrderMaterials: string[];
  catalogSheetUrls: string[];
  leadTimeDetails?: string;
  minimumOrderQuantities?: string;
  fabricationCapabilities?: string;
  supplierVisibilityRestricted?: boolean;
};

export type SupplierDirectoryResponse = {
  success: boolean;
  suppliers: SupplierDirectoryEntry[];
  error?: string;
};

export type Project = {
  id: string;
  ownerId: string;
  title: string;
  projectType: string;
  status: string;
  createdAt: string;
  location?: {
    city?: string;
    state?: string;
    zipCode?: string;
  };
};

export type ProjectsResponse = {
  success: boolean;
  projects: Project[];
  error?: string;
};

export type CreateProjectInput = {
  ownerId: string;
  projectType: string;
  title: string;
  description?: string;
  location: {
    city: string;
    state: string;
    zipCode: string;
  };
};

export type AnalyzePhotoResponse = {
  success: boolean;
  analysis?: {
    measurements?: Record<string, string>;
    materials?: Array<{ name: string; quantity: string; unit: string }>;
    condition?: string;
    recommendations?: string[];
    rawAnalysis?: string;
  };
  note?: string;
  error?: string;
};

export type ContractorMatch = {
  contractor: {
    id: string;
    name: string;
    rating: number;
    specialties: string[];
    availability: string;
  };
  matchScore: number;
  recommendationLevel: string;
  matchReasons: string[];
};

export type MatchContractorsResponse = {
  success: boolean;
  matches: ContractorMatch[];
  totalMatches: number;
  error?: string;
};

export type EstimatesResponse = {
  success: boolean;
  estimates: Array<{
    id: string;
    projectId: string;
    contractorId: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  error?: string;
};

export type ConversationsResponse = {
  success: boolean;
  conversations?: Array<{
    id: string;
    participantInfo?: { id: string; name: string; type: string };
    projectTitle?: string;
    unreadCount?: number;
    lastMessage?: { content: string; timestamp: string };
  }>;
  error?: string;
};

export type MessageRecord = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
};

export type MessagesResponse = {
  success: boolean;
  messages?: MessageRecord[];
  error?: string;
};

export type CreateEstimateResponse = {
  success: boolean;
  estimate?: {
    id: string;
    projectId: string;
    contractorId: string;
    total: number;
    status: string;
    createdAt: string;
  };
  error?: string;
};

export type SchedulerProject = {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
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
  projects: SchedulerProject[];
  tasks: SchedulerTask[];
};

export type SchedulerStateResponse = {
  success: boolean;
  state: SchedulerState;
  error?: string;
};

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token =
      window.localStorage.getItem('buildvault.authToken') ||
      window.sessionStorage.getItem('buildvault.authToken') ||
      null;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers,
    cache: 'no-store',
  });

  const data = (await response.json()) as T & ApiError;

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data as T;
}

export const webApi = {
  getHealth() {
    return apiRequest<HealthResponse>('/api/health', { method: 'GET' });
  },
  login(email: string, password: string) {
    return apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
  getProfile(userId: string) {
    return apiRequest<UserProfileResponse>(`/api/users/profile?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
    });
  },
  getSuppliers(viewerType: WebUserType) {
    return apiRequest<SupplierDirectoryResponse>(`/api/users/suppliers?viewerType=${encodeURIComponent(viewerType)}`, {
      method: 'GET',
    });
  },
  getProjects() {
    return apiRequest<ProjectsResponse>('/api/projects', { method: 'GET' });
  },
  createProject(input: CreateProjectInput) {
    return apiRequest<{ success: boolean; project: Project; error?: string }>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  analyzePhoto(photoUrl: string, projectType: string) {
    return apiRequest<AnalyzePhotoResponse>('/api/ai/analyze-photo', {
      method: 'POST',
      body: JSON.stringify({ photoUrl, projectType }),
    });
  },
  matchContractors(input: {
    projectType: string;
    budget: number;
    location: { zipCode: string; city: string; state: string };
    services: string[];
  }) {
    return apiRequest<MatchContractorsResponse>('/api/ai/match-contractors', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  getEstimates(projectId: string) {
    return apiRequest<EstimatesResponse>(`/api/estimates?projectId=${encodeURIComponent(projectId)}`, {
      method: 'GET',
    });
  },
  getConversations(userId: string) {
    return apiRequest<ConversationsResponse>(`/api/messages?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
    });
  },
  getMessages(userId: string, conversationId: string) {
    return apiRequest<MessagesResponse>(
      `/api/messages?userId=${encodeURIComponent(userId)}&conversationId=${encodeURIComponent(conversationId)}`,
      { method: 'GET' }
    );
  },
  sendMessage(input: {
    conversationId?: string;
    senderId: string;
    receiverId: string;
    content: string;
    projectId?: string;
  }) {
    return apiRequest<{ success: boolean; message?: MessageRecord; error?: string }>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  createEstimate(input: {
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
  }) {
    return apiRequest<CreateEstimateResponse>('/api/estimates', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  acceptEstimate(input: { estimateId: string; userId: string; projectId: string }) {
    return apiRequest<{ success: boolean; message?: string; error?: string }>('/api/quotes/accept', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  rejectEstimate(input: { estimateId: string; userId: string; projectId: string }) {
    return apiRequest<{ success: boolean; message?: string; error?: string }>('/api/quotes/reject', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  getSchedulerState(userId: string) {
    return apiRequest<SchedulerStateResponse>(`/api/scheduler?userId=${encodeURIComponent(userId)}`, {
      method: 'GET',
    });
  },
  saveSchedulerState(userId: string, state: SchedulerState) {
    return apiRequest<SchedulerStateResponse>('/api/scheduler', {
      method: 'PUT',
      body: JSON.stringify({ userId, state }),
    });
  },
};
