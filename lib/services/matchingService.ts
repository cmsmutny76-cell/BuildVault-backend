import { sendMatchResultsEmail } from '../email';
import { getContractorAvailability } from './contractorAvailabilityService';
import { logPlatformEvent } from '../eventLogger';

export interface MatchCriteria {
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
  notify?: {
    email: string;
    name: string;
  };
}

interface MockContractor {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  yearsExperience: number;
  completedProjects: number;
  responseTime: number;
  budgetRange: { min: number; max: number };
  serviceRadius: number;
  location: { city: string; state: string; zipCode: string };
  availability: 'available' | 'busy' | 'booked';
  certifications: string[];
}

export interface ContractorMatchResult {
  contractor: MockContractor;
  matchScore: number;
  matchReasons: string[];
  recommendationLevel: 'excellent' | 'great' | 'good' | 'fair';
}

function getRecommendationLevel(score: number): ContractorMatchResult['recommendationLevel'] {
  if (score >= 85) {
    return 'excellent';
  }
  if (score >= 70) {
    return 'great';
  }
  if (score >= 50) {
    return 'good';
  }
  return 'fair';
}

const mockContractors: MockContractor[] = [
  {
    id: 'cont_1',
    name: 'Premium Builders LLC',
    rating: 4.8,
    reviewCount: 127,
    specialties: ['Commercial', 'Multi-Family', 'Remodeling'],
    yearsExperience: 15,
    completedProjects: 340,
    responseTime: 2,
    budgetRange: { min: 50000, max: 500000 },
    serviceRadius: 50,
    location: { city: 'Austin', state: 'TX', zipCode: '78701' },
    availability: 'available',
    certifications: ['Licensed', 'Insured', 'Bonded'],
  },
  {
    id: 'cont_2',
    name: 'Ace Construction Co',
    rating: 4.6,
    reviewCount: 89,
    specialties: ['Residential', 'Apartment', 'Remodeling'],
    yearsExperience: 10,
    completedProjects: 215,
    responseTime: 4,
    budgetRange: { min: 20000, max: 200000 },
    serviceRadius: 30,
    location: { city: 'Austin', state: 'TX', zipCode: '78702' },
    availability: 'available',
    certifications: ['Licensed', 'Insured'],
  },
  {
    id: 'cont_3',
    name: 'Elite Renovations',
    rating: 4.9,
    reviewCount: 203,
    specialties: ['Multi-Family', 'Apartment', 'Developer'],
    yearsExperience: 20,
    completedProjects: 520,
    responseTime: 1,
    budgetRange: { min: 75000, max: 1000000 },
    serviceRadius: 75,
    location: { city: 'Austin', state: 'TX', zipCode: '78703' },
    availability: 'busy',
    certifications: ['Licensed', 'Insured', 'Bonded', 'OSHA Certified'],
  },
];

export async function matchContractors(criteria: MatchCriteria): Promise<{
  matches: ContractorMatchResult[];
  notificationSent: boolean;
}> {
  const availabilityOverrides = await Promise.all(
    mockContractors.map(async (contractor) => ({
      contractorId: contractor.id,
      availability: await getContractorAvailability(contractor.id),
    }))
  );
  const availabilityByContractorId = new Map(
    availabilityOverrides.map((entry) => [entry.contractorId, entry.availability])
  );

  const matches = mockContractors.map((contractor) => {
    const availabilityOverride = availabilityByContractorId.get(contractor.id);
    const effectiveAvailability = availabilityOverride || contractor.availability;

    let score = 0;
    const reasons: string[] = [];

    const hasMatchingSpecialty = contractor.specialties.some((spec) =>
      criteria.projectType.toLowerCase().includes(spec.toLowerCase())
    );
    if (hasMatchingSpecialty) {
      score += 30;
      reasons.push('Specializes in your project type');
    }

    const budgetFits = criteria.budget >= contractor.budgetRange.min && criteria.budget <= contractor.budgetRange.max;
    if (budgetFits) {
      score += 25;
      reasons.push('Budget matches their range');
    } else if (criteria.budget < contractor.budgetRange.min) {
      score += 5;
      reasons.push('Budget below typical range');
    } else {
      score += 15;
      reasons.push('Budget within capacity');
    }

    const ratingScore = (contractor.rating / 5) * 15;
    const reviewScore = Math.min((contractor.reviewCount / 100) * 5, 5);
    score += ratingScore + reviewScore;
    if (contractor.rating >= 4.7) {
      reasons.push('Highly rated by clients');
    }

    const experienceScore = Math.min((contractor.yearsExperience / 20) * 10, 10);
    score += experienceScore;
    if (contractor.yearsExperience >= 15) {
      reasons.push(`${contractor.yearsExperience} years of experience`);
    }

    const responseScore = Math.max(10 - contractor.responseTime * 2, 0);
    score += responseScore;
    if (contractor.responseTime <= 2) {
      reasons.push('Fast response time');
    }

    if (effectiveAvailability === 'available') {
      score += 5;
      reasons.push('Currently available');
    } else if (effectiveAvailability === 'busy') {
      score += 2;
    }

    if (contractor.certifications.includes('Bonded')) {
      score += 3;
      reasons.push('Bonded for your protection');
    }
    if (contractor.certifications.includes('Insured')) {
      score += 2;
    }

    if (criteria.timeline) {
      if (effectiveAvailability === 'available') {
        score += 3;
        reasons.push('Timeline aligns with current availability');
      } else if (effectiveAvailability === 'busy') {
        score += 1;
      }
    }

    if (criteria.urgency === 'high') {
      if (contractor.responseTime <= 2 && effectiveAvailability === 'available') {
        score += 2;
        reasons.push('Strong fit for urgent project start');
      }
    } else if (criteria.urgency === 'medium') {
      if (contractor.responseTime <= 4) {
        score += 1;
      }
    }

    const normalizedScore = Math.min(Math.round(score), 100);

    return {
      contractor: {
        ...contractor,
        availability: effectiveAvailability,
      },
      matchScore: normalizedScore,
      matchReasons: reasons,
      recommendationLevel: getRecommendationLevel(normalizedScore),
    };
  });

  matches.sort((a, b) => b.matchScore - a.matchScore);

  let notificationSent = false;
  if (criteria.notify?.email && criteria.notify?.name) {
    const emailResult = await sendMatchResultsEmail(
      criteria.notify.email,
      criteria.notify.name,
      criteria.projectType,
      matches.length,
      matches.map((item) => ({
        name: item.contractor.name,
        matchScore: item.matchScore,
        rating: item.contractor.rating,
      }))
    );

    notificationSent = emailResult.success;
    if (!emailResult.success) {
      console.error('Failed to send match notification email');
    }
  }

  logPlatformEvent({
    type: 'contractor_matched',
    entityType: 'matching',
    entityId: criteria.projectId,
    metadata: {
      projectId: criteria.projectId,
      projectType: criteria.projectType,
      totalMatches: matches.length,
      topMatchId: matches[0]?.contractor.id,
      topMatchScore: matches[0]?.matchScore,
      notificationSent,
    },
  });

  return { matches, notificationSent };
}
