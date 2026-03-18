export type EstimateCategory = 'labor' | 'materials' | 'equipment' | 'permits' | 'other';

export type EstimateStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export interface EstimateLineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
  category: EstimateCategory;
}

export interface EstimateLineItem extends EstimateLineItemInput {
  id: string;
  total: number;
}

export interface EstimateRecord {
  id: string;
  projectId: string;
  contractorId: string;
  projectTitle: string;
  status: EstimateStatus;
  lineItems: EstimateLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  validUntil: string;
  createdAt: string;
}

export interface EstimateRevisionChange {
  field: string;
  before: string | number;
  after: string | number;
}

export interface EstimateRevision {
  id: string;
  estimateId: string;
  updatedBy: string;
  reason: string;
  changes: EstimateRevisionChange[];
  createdAt: string;
}

export interface EstimateParty {
  name: string;
  businessName?: string;
  email: string;
  phone?: string;
  address?: string;
  licenseNumber?: string;
}

export interface EstimatePdfData {
  id: string;
  projectTitle: string;
  projectId: string;
  contractor: EstimateParty;
  homeowner: EstimateParty;
  lineItems: EstimateLineItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  notes?: string;
  validUntil: string;
  createdAt: string;
}
