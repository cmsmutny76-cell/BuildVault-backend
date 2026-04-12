// Project and Contractor Profile Types for AI Matching

export type ProfileUserType =
  | 'homeowner'
  | 'employment_seeker'
  | 'contractor'
  | 'commercial_builder'
  | 'multi_family_owner'
  | 'apartment_owner'
  | 'developer'
  | 'landscaper'
  | 'school';

export type PaidProfileUserType = Exclude<ProfileUserType, 'homeowner' | 'employment_seeker'>;

export type SubscriptionPlanId =
  | 'contractor_pro'
  | 'commercial_pro'
  | 'landscaper_pro'
  | 'school_pro';

export type BusinessEntityType = 'sole-proprietor' | 'llc' | 'corporation' | 'partnership';
export type ProjectCategory =
  | 'residential'
  | 'commercial'
  | 'multi-family'
  | 'apartment'
  | 'landscaping'
  | 'developer';
export type ProjectType = 'standard-remodel' | 'custom-job';
export type ServiceType = 'full-project' | 'plumbing' | 'roofing' | 'minor-repairs' | 'handyman' | 'electrical' | 'hvac' | 'painting' | 'flooring' | 'other';
export type ExperienceLevel = 'entry-level' | 'intermediate' | 'expert' | 'master-craftsman';
export type BudgetRange = 'under-5k' | '5k-15k' | '15k-50k' | '50k-100k' | '100k-250k' | '250k-500k' | '500k-plus';
export type ProjectScaleRange = '100k-500k' | '500k-2m' | '2m-10m' | '10m-plus';
export type PortfolioValueRange = '1m-10m' | '10m-50m' | '50m-100m' | '100m-plus';

export type CommercialProjectType =
  | 'office'
  | 'retail'
  | 'warehouse'
  | 'industrial'
  | 'mixed-use'
  | 'healthcare'
  | 'government';

export type MultiFamilyPropertyType =
  | 'duplex'
  | 'triplex'
  | 'townhome-community'
  | 'small-complex'
  | 'large-complex';

export type RenovationScope =
  | 'full-rehab'
  | 'unit-upgrades'
  | 'common-areas'
  | 'building-systems'
  | 'exterior-facade'
  | 'amenities'
  | 'turnover-prep';

export type ApartmentClass = 'class-a' | 'class-b' | 'class-c';

export type DevelopmentType =
  | 'residential'
  | 'commercial'
  | 'mixed-use'
  | 'industrial'
  | 'land-development'
  | 'adaptive-reuse';

export type DevelopmentStage =
  | 'pre-development'
  | 'under-construction'
  | 'stabilized'
  | 'value-add';

export type FinancingSource =
  | 'private-equity'
  | 'construction-loan'
  | 'cmbs'
  | 'self-financed';

export type LandscapingServiceType =
  | 'design'
  | 'installation'
  | 'maintenance'
  | 'irrigation'
  | 'hardscaping'
  | 'tree-service'
  | 'turf-management'
  | 'snow-removal';

export type LandscaperClientType =
  | 'residential'
  | 'commercial'
  | 'hoa'
  | 'municipal'
  | 'golf-recreation';

export type SchoolType =
  | 'vocational-trade-school'
  | 'apprenticeship-program'
  | 'community-college-trade-department'
  | 'industry-training-center';

export type ConstructionProgram =
  | 'carpentry'
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'welding'
  | 'masonry'
  | 'painting'
  | 'landscaping'
  | 'heavy-equipment'
  | 'construction-management';

export type ProgramLength = 'weeks' | 'months' | '1-2-years' | '2-plus-years';

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
  businessType: BusinessEntityType;
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

export interface ProfileServiceArea {
  city: string;
  state: string;
  zipCode: string;
  serviceRadius: number;
  additionalZipCodes?: string[];
}

export interface PaidSubscriptionProfile {
  userType: PaidProfileUserType;
  plan: SubscriptionPlanId;
  monthlyPrice: number;
  trialDays: number;
}

export interface CommercialBuilderProfile {
  id: string;
  userId: string;
  companyName: string;
  businessType: BusinessEntityType;
  yearsInBusiness: number;
  completedProjects: number;
  commercialProjectTypes: CommercialProjectType[];
  typicalProjectScales: ProjectScaleRange[];
  activeBids: number;
  email: string;
  phone: string;
  website?: string;
  licenseNumber?: string;
  licenseState?: string;
  isInsured: boolean;
  isBonded: boolean;
  serviceArea: ProfileServiceArea;
  isAcceptingNewProjects: boolean;
  maximumProjectsPerMonth?: number;
  subscription: PaidSubscriptionProfile;
}

export interface MultiFamilyOwnerProfile {
  id: string;
  userId: string;
  companyName: string;
  businessType: BusinessEntityType;
  yearsInBusiness: number;
  email: string;
  phone: string;
  portfolioPropertyCount: number;
  totalManagedUnits: number;
  propertyTypes: MultiFamilyPropertyType[];
  renovationScopes: RenovationScope[];
  typicalBudgetRanges: BudgetRange[];
  serviceArea: ProfileServiceArea;
  maximumProjectsPerMonth?: number;
  subscription: PaidSubscriptionProfile;
}

export interface ApartmentOwnerProfile {
  id: string;
  userId: string;
  companyName: string;
  businessType: BusinessEntityType;
  email: string;
  phone: string;
  propertyCount: number;
  totalUnitCount: number;
  apartmentClass: ApartmentClass;
  renovationFocus: RenovationScope[];
  typicalBudgetRanges: BudgetRange[];
  serviceArea: ProfileServiceArea;
  isAcceptingNewProjects: boolean;
  subscription: PaidSubscriptionProfile;
}

export interface DeveloperProfile {
  id: string;
  userId: string;
  companyName: string;
  businessType: BusinessEntityType;
  yearsInBusiness: number;
  email: string;
  phone: string;
  website?: string;
  developmentTypes: DevelopmentType[];
  developmentStages: DevelopmentStage[];
  portfolioValueRange: PortfolioValueRange;
  activeProjectCount: number;
  completedDevelopments: number;
  financingSources: FinancingSource[];
  primaryMarket: ProfileServiceArea;
  maximumProjectsPerMonth?: number;
  subscription: PaidSubscriptionProfile;
}

export interface LandscaperProfile {
  id: string;
  userId: string;
  companyName: string;
  businessType: BusinessEntityType;
  yearsInBusiness: number;
  email: string;
  phone: string;
  website?: string;
  landscapingServices: LandscapingServiceType[];
  clientTypes: LandscaperClientType[];
  typicalBudgetRanges: BudgetRange[];
  licenseNumber?: string;
  licenseState?: string;
  isInsured: boolean;
  isBonded: boolean;
  isIsaCertifiedArborist: boolean;
  isNalpCertified: boolean;
  serviceArea: ProfileServiceArea;
  maximumAccountsPerMonth?: number;
  subscription: PaidSubscriptionProfile;
}

export interface SchoolProfile {
  id: string;
  userId: string;
  schoolName: string;
  schoolType: SchoolType;
  isAccredited: boolean;
  enrollmentCapacity: number;
  programsOffered: ConstructionProgram[];
  programLength: ProgramLength;
  jobPlacementAssistance: boolean;
  jobPlacementRate?: number;
  industryPartners?: string[];
  contactName: string;
  email: string;
  phone: string;
  location: ProjectLocation;
  servesRemoteStudents: boolean;
  subscription: PaidSubscriptionProfile;
}
