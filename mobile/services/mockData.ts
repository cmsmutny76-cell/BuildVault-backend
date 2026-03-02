// Mock Data Service for Testing Without API Keys

export interface MockContractor {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  licenses: string[];
  insurance: {
    liability: boolean;
    workersComp: boolean;
    bonded: boolean;
  };
  specialties: string[];
  serviceArea: {
    city: string;
    state: string;
    radius: number; // miles
  };
  availability: 'available' | 'busy' | 'booked';
  hourlyRate: number;
  projectsCompleted: number;
  responseTime: string; // e.g., "within 2 hours"
  portfolio: {
    id: string;
    title: string;
    description: string;
    cost: number;
    duration: string;
    images: string[];
  }[];
  certifications: string[];
  bio: string;
}

export interface MockProject {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  homeownerId: string;
  contractorId?: string;
  budget: number;
  description: string;
  services: string[];
  location: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  timeline: {
    startDate?: string;
    endDate?: string;
    estimatedDuration: string;
  };
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MockEstimate {
  id: string;
  projectId: string;
  contractorId: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  lineItems: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    category: 'labor' | 'materials' | 'equipment' | 'permits' | 'other';
  }[];
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
  notes: string;
  createdAt: string;
}

export interface MockMessage {
  id: string;
  senderId: string;
  receiverId: string;
  projectId: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachments?: string[];
}

export interface MockReview {
  id: string;
  projectId: string;
  contractorId: string;
  homeownerId: string;
  rating: number;
  comment: string;
  categories: {
    quality: number;
    communication: number;
    punctuality: number;
    professionalism: number;
    value: number;
  };
  timestamp: string;
  response?: string; // Contractor's response
}

// Mock Contractors Data
export const mockContractors: MockContractor[] = [
  {
    id: 'c1',
    name: 'John Martinez',
    companyName: 'Martinez Construction LLC',
    email: 'john@martinezconst.com',
    phone: '(555) 123-4567',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    rating: 4.8,
    reviewCount: 127,
    yearsExperience: 15,
    licenses: ['CA-1234567', 'B-General Building Contractor'],
    insurance: {
      liability: true,
      workersComp: true,
      bonded: true,
    },
    specialties: ['Kitchen Remodeling', 'Bathroom Renovation', 'Home Additions', 'General Construction'],
    serviceArea: {
      city: 'Los Angeles',
      state: 'CA',
      radius: 30,
    },
    availability: 'available',
    hourlyRate: 85,
    projectsCompleted: 245,
    responseTime: 'within 2 hours',
    portfolio: [
      {
        id: 'p1',
        title: 'Modern Kitchen Remodel',
        description: 'Complete kitchen renovation with custom cabinets, quartz countertops, and new appliances',
        cost: 35000,
        duration: '6 weeks',
        images: [
          'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
        ],
      },
      {
        id: 'p2',
        title: 'Master Bathroom Renovation',
        description: 'Luxury bathroom upgrade with walk-in shower, double vanity, and heated floors',
        cost: 28000,
        duration: '4 weeks',
        images: [
          'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80',
        ],
      },
    ],
    certifications: ['Lead-Safe Certified', 'OSHA 30-Hour', 'Green Building Professional'],
    bio: 'With over 15 years of experience in residential construction, I specialize in bringing homeowners\' visions to life. My team and I pride ourselves on quality craftsmanship, clear communication, and completing projects on time and within budget.',
  },
  {
    id: 'c2',
    name: 'Sarah Chen',
    companyName: 'Chen Roofing & Exteriors',
    email: 'sarah@chenroofing.com',
    phone: '(555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    rating: 4.9,
    reviewCount: 89,
    yearsExperience: 12,
    licenses: ['CA-2345678', 'C-39 Roofing Contractor'],
    insurance: {
      liability: true,
      workersComp: true,
      bonded: true,
    },
    specialties: ['Roofing', 'Siding', 'Gutters', 'Window Installation'],
    serviceArea: {
      city: 'San Diego',
      state: 'CA',
      radius: 40,
    },
    availability: 'busy',
    hourlyRate: 95,
    projectsCompleted: 178,
    responseTime: 'within 4 hours',
    portfolio: [
      {
        id: 'p3',
        title: 'Complete Roof Replacement',
        description: 'Asphalt shingle roof replacement with new underlayment and ventilation',
        cost: 18500,
        duration: '3 days',
        images: [
          'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=800&q=80',
        ],
      },
    ],
    certifications: ['GAF Master Elite', 'CertainTeed Select ShingleMaster', 'HAAG Certified Inspector'],
    bio: 'Specializing in residential roofing and exterior work, my team delivers top-quality installations backed by the best warranties in the industry. We\'re certified by all major manufacturers and maintain the highest safety standards.',
  },
  {
    id: 'c3',
    name: 'Marcus Thompson',
    companyName: 'Thompson Plumbing Services',
    email: 'marcus@thompsonplumbing.com',
    phone: '(555) 345-6789',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    rating: 4.7,
    reviewCount: 156,
    yearsExperience: 20,
    licenses: ['CA-3456789', 'C-36 Plumbing Contractor'],
    insurance: {
      liability: true,
      workersComp: true,
      bonded: false,
    },
    specialties: ['Plumbing Repair', 'Pipe Replacement', 'Water Heater Installation', 'Drain Cleaning'],
    serviceArea: {
      city: 'Los Angeles',
      state: 'CA',
      radius: 25,
    },
    availability: 'available',
    hourlyRate: 75,
    projectsCompleted: 412,
    responseTime: 'within 1 hour',
    portfolio: [],
    certifications: ['Master Plumber', 'Backflow Prevention Certified', 'Medical Gas Installer'],
    bio: '20+ years serving the LA area with honest, reliable plumbing services. Available for emergencies 24/7. No job too big or small.',
  },
  {
    id: 'c4',
    name: 'Emily Rodriguez',
    companyName: 'Rodriguez Landscaping & Design',
    email: 'emily@rodriguezlandscaping.com',
    phone: '(555) 456-7890',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
    rating: 5.0,
    reviewCount: 64,
    yearsExperience: 8,
    licenses: ['CA-4567890', 'C-27 Landscaping Contractor'],
    insurance: {
      liability: true,
      workersComp: true,
      bonded: true,
    },
    specialties: ['Landscape Design', 'Hardscaping', 'Irrigation', 'Outdoor Lighting', 'Drought-Tolerant Gardens'],
    serviceArea: {
      city: 'Santa Barbara',
      state: 'CA',
      radius: 35,
    },
    availability: 'available',
    hourlyRate: 70,
    projectsCompleted: 98,
    responseTime: 'within 3 hours',
    portfolio: [
      {
        id: 'p4',
        title: 'Drought-Resistant Backyard Oasis',
        description: 'Complete landscape redesign with native plants, drip irrigation, and natural stone patio',
        cost: 24000,
        duration: '2 weeks',
        images: [
          'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80',
        ],
      },
    ],
    certifications: ['Certified Landscape Designer', 'Irrigation Association Certified', 'Water Conservation Specialist'],
    bio: 'Creating beautiful, sustainable outdoor spaces that thrive in our California climate. I focus on water-wise designs that reduce maintenance and look stunning year-round.',
  },
  {
    id: 'c5',
    name: 'David Kim',
    companyName: 'Kim Electrical Solutions',
    email: 'david@kimelectrical.com',
    phone: '(555) 567-8901',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
    rating: 4.9,
    reviewCount: 103,
    yearsExperience: 14,
    licenses: ['CA-5678901', 'C-10 Electrical Contractor'],
    insurance: {
      liability: true,
      workersComp: true,
      bonded: true,
    },
    specialties: ['Electrical Repairs', 'Panel Upgrades', 'EV Charger Installation', 'Smart Home Wiring', 'Solar Integration'],
    serviceArea: {
      city: 'San Francisco',
      state: 'CA',
      radius: 20,
    },
    availability: 'busy',
    hourlyRate: 90,
    projectsCompleted: 287,
    responseTime: 'within 2 hours',
    portfolio: [],
    certifications: ['Master Electrician', 'Tesla Certified Installer', 'Smart Home Integration Specialist'],
    bio: 'Licensed master electrician specializing in modern electrical solutions. From basic repairs to complete smart home installations, I ensure every job meets code and exceeds expectations.',
  },
];

// Mock Projects Data
export const mockProjects: MockProject[] = [
  {
    id: 'proj1',
    title: 'Kitchen Remodel',
    category: 'residential',
    status: 'pending',
    homeownerId: 'user1',
    budget: 40000,
    description: 'Looking to completely remodel our kitchen with new cabinets, countertops, appliances, and flooring.',
    services: ['Kitchen Remodeling', 'Cabinetry', 'Countertops', 'Flooring'],
    location: {
      street: '123 Main Street',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
    },
    timeline: {
      estimatedDuration: '6-8 weeks',
    },
    photos: [
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80',
    ],
    createdAt: '2026-02-15T10:30:00Z',
    updatedAt: '2026-02-15T10:30:00Z',
  },
  {
    id: 'proj2',
    title: 'Roof Repair',
    category: 'residential',
    status: 'in-progress',
    homeownerId: 'user1',
    contractorId: 'c2',
    budget: 8000,
    description: 'Need to repair damaged shingles and fix a leak in the southeast corner.',
    services: ['Roofing', 'Leak Repair'],
    location: {
      street: '123 Main Street',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
    },
    timeline: {
      startDate: '2026-03-01',
      endDate: '2026-03-05',
      estimatedDuration: '4 days',
    },
    photos: [],
    createdAt: '2026-02-20T14:20:00Z',
    updatedAt: '2026-03-01T09:00:00Z',
  },
];

// Mock Estimates Data
export const mockEstimates: MockEstimate[] = [
  {
    id: 'est1',
    projectId: 'proj1',
    contractorId: 'c1',
    status: 'sent',
    lineItems: [
      {
        id: 'li1',
        description: 'Demolition and removal of existing kitchen',
        quantity: 1,
        unitPrice: 2500,
        total: 2500,
        category: 'labor',
      },
      {
        id: 'li2',
        description: 'Custom cabinet installation (20 linear feet)',
        quantity: 20,
        unitPrice: 350,
        total: 7000,
        category: 'materials',
      },
      {
        id: 'li3',
        description: 'Quartz countertops (60 sq ft)',
        quantity: 60,
        unitPrice: 85,
        total: 5100,
        category: 'materials',
      },
      {
        id: 'li4',
        description: 'Labor - Cabinet & Countertop Installation',
        quantity: 40,
        unitPrice: 85,
        total: 3400,
        category: 'labor',
      },
      {
        id: 'li5',
        description: 'Appliance installation (range, dishwasher, microwave)',
        quantity: 1,
        unitPrice: 1200,
        total: 1200,
        category: 'labor',
      },
      {
        id: 'li6',
        description: 'Flooring - LVP (200 sq ft)',
        quantity: 200,
        unitPrice: 45,
        total: 9000,
        category: 'materials',
      },
      {
        id: 'li7',
        description: 'Plumbing & Electrical Updates',
        quantity: 1,
        unitPrice: 3500,
        total: 3500,
        category: 'labor',
      },
      {
        id: 'li8',
        description: 'Paint & Finish Work',
        quantity: 1,
        unitPrice: 1800,
        total: 1800,
        category: 'labor',
      },
    ],
    subtotal: 33500,
    tax: 3015,
    total: 36515,
    validUntil: '2026-03-15',
    notes: 'Estimate includes all labor, materials, and standard finish options. Premium upgrades available. Payment schedule: 30% deposit, 40% at midpoint, 30% upon completion.',
    createdAt: '2026-02-16T11:00:00Z',
  },
];

// Mock Messages Data
export const mockMessages: MockMessage[] = [
  {
    id: 'msg1',
    senderId: 'c1',
    receiverId: 'user1',
    projectId: 'proj1',
    content: 'Hi! I reviewed your kitchen remodel project and would love to provide you with a detailed estimate. Are you available for a quick site visit this week?',
    timestamp: '2026-02-16T09:30:00Z',
    read: true,
  },
  {
    id: 'msg2',
    senderId: 'user1',
    receiverId: 'c1',
    projectId: 'proj1',
    content: 'Yes, I\'m available Tuesday or Thursday afternoon. What time works best for you?',
    timestamp: '2026-02-16T10:15:00Z',
    read: true,
  },
  {
    id: 'msg3',
    senderId: 'c1',
    receiverId: 'user1',
    projectId: 'proj1',
    content: 'Thursday at 2 PM would be perfect. I\'ll bring some material samples and we can discuss your vision in detail.',
    timestamp: '2026-02-16T10:45:00Z',
    read: false,
  },
];

// Mock Reviews Data
export const mockReviews: MockReview[] = [
  {
    id: 'rev1',
    projectId: 'proj1',
    contractorId: 'c1',
    homeownerId: 'user1',
    rating: 5,
    comment: 'John and his team did an outstanding job on our kitchen remodel. The quality of work exceeded our expectations, and they finished ahead of schedule. Highly recommend!',
    categories: {
      quality: 5,
      communication: 5,
      punctuality: 5,
      professionalism: 5,
      value: 4,
    },
    timestamp: '2026-01-15T14:30:00Z',
    response: 'Thank you so much for the kind words! It was a pleasure working with you and we\'re thrilled you love your new kitchen.',
  },
  {
    id: 'rev2',
    projectId: 'proj2',
    contractorId: 'c2',
    homeownerId: 'user2',
    rating: 5,
    comment: 'Sarah was professional, punctual, and her work is top-notch. Our new roof looks amazing and no more leaks!',
    categories: {
      quality: 5,
      communication: 5,
      punctuality: 5,
      professionalism: 5,
      value: 5,
    },
    timestamp: '2026-02-20T16:00:00Z',
  },
];

// Helper Functions
export const getContractorById = (id: string): MockContractor | undefined => {
  return mockContractors.find(c => c.id === id);
};

export const getProjectById = (id: string): MockProject | undefined => {
  return mockProjects.find(p => p.id === id);
};

export const getEstimatesByProjectId = (projectId: string): MockEstimate[] => {
  return mockEstimates.filter(e => e.projectId === projectId);
};

export const getMessagesByProjectId = (projectId: string): MockMessage[] => {
  return mockMessages.filter(m => m.projectId === projectId);
};

export const getReviewsByContractorId = (contractorId: string): MockReview[] => {
  return mockReviews.filter(r => r.contractorId === contractorId);
};

export const searchContractors = (filters: {
  specialty?: string;
  location?: string;
  minRating?: number;
  availability?: string;
  maxHourlyRate?: number;
}): MockContractor[] => {
  let results = [...mockContractors];

  if (filters.specialty) {
    results = results.filter(c => 
      c.specialties.some(s => s.toLowerCase().includes(filters.specialty!.toLowerCase()))
    );
  }

  if (filters.location) {
    results = results.filter(c => 
      c.serviceArea.city.toLowerCase().includes(filters.location!.toLowerCase()) ||
      c.serviceArea.state.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }

  if (filters.minRating) {
    results = results.filter(c => c.rating >= filters.minRating!);
  }

  if (filters.availability) {
    results = results.filter(c => c.availability === filters.availability);
  }

  if (filters.maxHourlyRate) {
    results = results.filter(c => c.hourlyRate <= filters.maxHourlyRate!);
  }

  return results;
};

// Calculate matching score for a contractor and project
export const calculateMatchScore = (contractor: MockContractor, project: MockProject): number => {
  let score = 0;
  
  // Service match (40 points)
  const serviceMatch = project.services.some(s => 
    contractor.specialties.some(cs => cs.toLowerCase().includes(s.toLowerCase()))
  );
  if (serviceMatch) score += 40;
  
  // Location proximity (20 points)
  if (contractor.serviceArea.city === project.location.city) score += 20;
  else if (contractor.serviceArea.state === project.location.state) score += 10;
  
  // Rating (20 points)
  score += contractor.rating * 4;
  
  // Availability (10 points)
  if (contractor.availability === 'available') score += 10;
  else if (contractor.availability === 'busy') score += 5;
  
  // Budget compatibility (10 points)
  const estimatedHours = 100; // rough estimate
  const contractorCost = contractor.hourlyRate * estimatedHours;
  const budgetRatio = contractorCost / project.budget;
  if (budgetRatio <= 0.8) score += 10;
  else if (budgetRatio <= 1.0) score += 5;
  
  return Math.min(100, Math.round(score));
};

export const getMatchedContractors = (project: MockProject): Array<MockContractor & { matchScore: number }> => {
  return mockContractors
    .map(contractor => ({
      ...contractor,
      matchScore: calculateMatchScore(contractor, project),
    }))
    .filter(c => c.matchScore >= 50) // Only show contractors with 50%+ match
    .sort((a, b) => b.matchScore - a.matchScore);
};
