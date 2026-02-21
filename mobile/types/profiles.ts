// Project and Contractor Profile Types for AI Matching

export type ProjectCategory = 'residential' | 'commercial' | 'apartment' | 'landscaping';
export type ProjectType = 'standard-remodel' | 'custom-job';
export type ServiceType = 'full-project' | 'plumbing' | 'roofing' | 'minor-repairs' | 'handyman' | 'electrical' | 'hvac' | 'painting' | 'flooring' | 'other';
export type ExperienceLevel = 'entry-level' | 'intermediate' | 'expert' | 'master-craftsman';
export type BudgetRange = 'under-5k' | '5k-15k' | '15k-50k' | '50k-100k' | '100k-250k' | '250k-500k' | '500k-plus';

export interface ProjectLocation {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  mapUrl?: string; // Only visible to paid contractor subscriptions
}

export interface ProjectProfile {
  id: string;
  homeownerId: string;
  title: string;
  
  // Location
  location: ProjectLocation;
  
  // Project Details
  category: ProjectCategory;
  projectType: ProjectType;
  serviceType: ServiceType;
  description: string;
  aiGeneratedOutline?: string;
  
  // Budget & Timeline
  budgetRange: BudgetRange;
  estimatedStartDate?: Date;
  desiredCompletionDate?: Date;
  isFlexibleTimeline: boolean;
  
  // Contractor Requirements
  experienceLevel: ExperienceLevel;
  requiresLicensed: boolean;
  requiresInsured: boolean;
  requiresBonded: boolean;
  
  // Contact Information
  contactName: string;
  email: string;
  phone: string;
  preferredContactMethod: 'email' | 'phone' | 'either';
  
  // Additional Requirements
  specificRequirements?: string[];
  materials?: string[]; // Materials needed or preferred
  permits?: boolean; // Need help with permits
  
  // Metadata
  status: 'draft' | 'active' | 'reviewing-bids' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  bidCount: number;
}

export interface ContractorProfile {
  id: string;
  userId: string;
  
  // Business Information
  businessName: string;
  businessType: 'sole-proprietor' | 'llc' | 'corporation' | 'partnership';
  yearsInBusiness: number;
  
  // Certifications & Licenses
  licenseNumber?: string;
  licenseState?: string;
  licenseExpiration?: Date;
  isInsured: boolean;
  insuranceExpiration?: Date;
  isBonded: boolean;
  
  // Specializations
  categories: ProjectCategory[]; // What types they work on
  serviceTypes: ServiceType[]; // What services they offer
  experienceLevel: ExperienceLevel;
  
  // Service Area
  serviceZipCodes: string[];
  serviceRadius: number; // miles from primary location
  primaryLocation: {
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Portfolio & Reviews
  completedProjects: number;
  averageRating: number;
  reviewCount: number;
  portfolioImages?: string[];
  certifications?: string[];
  
  // Availability & Pricing
  isAcceptingNewProjects: boolean;
  typicalBudgetRanges: BudgetRange[];
  responseTimeHours: number;
  
  // Contact
  email: string;
  phone: string;
  website?: string;
  
  // Subscription
  subscriptionTier: 'free' | 'basic' | 'pro' | 'premium';
  canViewMaps: boolean; // Paid feature
  monthlyLeadLimit?: number;
  
  // AI Matching Preferences
  preferredProjectTypes: ProjectType[];
  minimumBudget?: BudgetRange;
  maximumProjectsPerMonth?: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
  isVerified: boolean;
}

export interface MatchScore {
  projectId: string;
  contractorId: string;
  score: number; // 0-100
  matchReasons: string[];
  locationDistance?: number; // miles
  budgetMatch: boolean;
  categoryMatch: boolean;
  experienceMatch: boolean;
  availabilityMatch: boolean;
}
