import { NextRequest, NextResponse } from 'next/server';

interface MatchCriteria {
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
}

/**
 * POST /api/ai/match-contractors
 * AI-powered contractor matching algorithm
 */
export async function POST(request: NextRequest) {
  try {
    const criteria: MatchCriteria = await request.json();

    const { projectType, budget, location, services, timeline, urgency } = criteria;

    if (!projectType || !budget || !location || !services || services.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required matching criteria' },
        { status: 400 }
      );
    }

    // TODO: Query database for contractor and calculate real match scores
    // This is a mock implementation showing the algorithm logic

    const mockContractors = [
      {
        id: 'cont_1',
        name: 'Premium Builders LLC',
        rating: 4.8,
        reviewCount: 127,
        specialties: ['Commercial', 'Multi-Family', 'Remodeling'],
        yearsExperience: 15,
        completedProjects: 340,
        responseTime: 2, // hours
        budgetRange: { min: 50000, max: 500000 },
        serviceRadius: 50, // miles
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

    // Calculate match scores
    const matchedContractors = mockContractors.map((contractor) => {
      let score = 0;
      const reasons = [];

      // 1. Specialty match (30 points)
      const hasMatchingSpecialty = contractor.specialties.some((spec) =>
        projectType.toLowerCase().includes(spec.toLowerCase())
      );
      if (hasMatchingSpecialty) {
        score += 30;
        reasons.push('Specializes in your project type');
      }

      // 2. Budget compatibility (25 points)
      const budgetFits = budget >= contractor.budgetRange.min && budget <= contractor.budgetRange.max;
      if (budgetFits) {
        score += 25;
        reasons.push('Budget matches their range');
      } else if (budget < contractor.budgetRange.min) {
        score += 5;
        reasons.push('Budget below typical range');
      } else {
        score += 15;
        reasons.push('Budget within capacity');
      }

      // 3. Rating & reviews (20 points)
      const ratingScore = (contractor.rating / 5) * 15;
      const reviewScore = Math.min((contractor.reviewCount / 100) * 5, 5);
      score += ratingScore + reviewScore;
      if (contractor.rating >= 4.7) {
        reasons.push('Highly rated by clients');
      }

      // 4. Experience (10 points)
      const experienceScore = Math.min((contractor.yearsExperience / 20) * 10, 10);
      score += experienceScore;
      if (contractor.yearsExperience >= 15) {
        reasons.push(`${contractor.yearsExperience} years of experience`);
      }

      // 5. Response time (10 points)
      const responseScore = Math.max(10 - contractor.responseTime * 2, 0);
      score += responseScore;
      if (contractor.responseTime <= 2) {
        reasons.push('Fast response time');
      }

      // 6. Availability (5 points)
      if (contractor.availability === 'available') {
        score += 5;
        reasons.push('Currently available');
      } else if (contractor.availability === 'busy') {
        score += 2;
      }

      // 7. Certifications bonus (bonus points)
      if (contractor.certifications.includes('Bonded')) {
        score += 3;
        reasons.push('Bonded for your protection');
      }
      if (contractor.certifications.includes('Insured')) {
        score += 2;
      }

      // Normalize score to 0-100
      const normalizedScore = Math.min(Math.round(score), 100);

      return {
        contractor,
        matchScore: normalizedScore,
        matchReasons: reasons,
        recommendationLevel: 
          normalizedScore >= 85 ? 'excellent' :
          normalizedScore >= 70 ? 'great' :
          normalizedScore >= 50 ? 'good' : 'fair',
      };
    });

    // Sort by match score
    matchedContractors.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      matches: matchedContractors,
      matchCriteria: criteria,
      totalMatches: matchedContractors.length,
    });
  } catch (error) {
    console.error('Contractor matching error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to match contractors' },
      { status: 500 }
    );
  }
}
