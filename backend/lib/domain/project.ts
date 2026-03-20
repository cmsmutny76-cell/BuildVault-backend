export type ProjectStatus =
  | 'draft'
  | 'scoped'
  | 'estimating'
  | 'matched'
  | 'active'
  | 'completed'
  | 'cancelled';

export interface ProjectLocation {
  street?: string;
  city: string;
  state: string;
  zipCode: string;
  lat?: number;
  lng?: number;
}

export interface ProjectMaterial {
  name: string;
  quantity: number;
  unit: string;
  source?: string;
}

export interface ProjectCostEstimate {
  subtotal: number;
  tax: number;
  total: number;
  confidence?: number;
  sourceRefs?: string[];
}

export interface ProjectComplianceFinding {
  rule: string;
  reference: string;
  severity: 'info' | 'warning' | 'critical';
  confidence: number;
}

export interface Project {
  id: string;
  ownerId: string;
  projectType: string;
  title: string;
  description?: string;
  location: ProjectLocation;
  dimensions?: Record<string, string | number>;
  structuralComponents?: string[];
  materials?: ProjectMaterial[];
  costEstimate?: ProjectCostEstimate;
  timeline?: {
    startDate?: string;
    endDate?: string;
    estimatedDays?: number;
  };
  contractorAssignment?: {
    contractorId?: string;
    status: 'unassigned' | 'matched' | 'assigned' | 'in-progress' | 'completed';
  };
  compliance?: {
    codesCheckedAt?: string;
    findings: ProjectComplianceFinding[];
  };
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}
