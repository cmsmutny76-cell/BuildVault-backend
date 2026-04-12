import { NextRequest, NextResponse } from 'next/server';
import { dbQuery, isDatabaseEnabled } from '../../../../lib/db';

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

    if (!isDatabaseEnabled()) {
      return NextResponse.json(
        { success: false, error: 'Matching database is not configured' },
        { status: 503 }
      );
    }

    type ContractorRow = {
      id: string;
      first_name: string | null;
      last_name: string | null;
      business_name: string | null;
      city: string | null;
      state: string | null;
      zip_code: string | null;
      specialties: string[] | null;
      service_areas: string[] | null;
      user_type: string;
      subscription: {
        status?: string;
      } | null;
    };

    const contractors = await dbQuery<ContractorRow>(
      `SELECT id, first_name, last_name, business_name, city, state, zip_code,
              specialties, service_areas, user_type, subscription
       FROM users
       WHERE user_type = ANY($1::text[])
         AND (subscription IS NULL OR (subscription->>'status') IN ('active', 'trial'))`,
      [['contractor', 'commercial_builder', 'landscaper', 'school', 'developer', 'multi_family_owner', 'apartment_owner']]
    );

    // Calculate match scores
    const matchedContractors = contractors.map((contractor) => {
      let score = 0;
      const reasons: string[] = [];

      const contractorName = contractor.business_name || `${contractor.first_name || ''} ${contractor.last_name || ''}`.trim() || contractor.id;
      const contractorSpecialties = contractor.specialties || [];
      const contractorServiceAreas = contractor.service_areas || [];

      const specialtyBlob = `${projectType} ${services.join(' ')}`.toLowerCase();

      // 1. Specialty match (30 points)
      const hasMatchingSpecialty = contractorSpecialties.some((spec) =>
        specialtyBlob.includes(spec.toLowerCase()) || spec.toLowerCase().includes(projectType.toLowerCase())
      );
      if (hasMatchingSpecialty) {
        score += 30;
        reasons.push('Specializes in your project type');
      }

      // 2. Location compatibility (25 points)
      const cityMatch = contractor.city?.toLowerCase() === location.city.toLowerCase();
      const stateMatch = contractor.state?.toLowerCase() === location.state.toLowerCase();
      const zipInServiceAreas = contractorServiceAreas.includes(location.zipCode);
      if (cityMatch && stateMatch) {
        score += 25;
        reasons.push('Serves your exact city');
      } else if (stateMatch || zipInServiceAreas) {
        score += 15;
        reasons.push('Serves your area');
      }

      // 3. Service overlap (20 points)
      const serviceMatches = services.filter((service) =>
        contractorSpecialties.some((spec) => spec.toLowerCase().includes(service.toLowerCase()) || service.toLowerCase().includes(spec.toLowerCase()))
      ).length;
      score += Math.min(20, serviceMatches * 6);

      // 4. Subscription confidence (10 points)
      const status = contractor.subscription?.status;
      if (status === 'active') {
        score += 10;
        reasons.push('Active professional subscription');
      } else if (status === 'trial') {
        score += 6;
      }

      // 5. Urgency compatibility (5 points)
      if (urgency === 'high' && status === 'active') {
        score += 5;
        reasons.push('Good fit for urgent timeline');
      }

      // Normalize score to 0-100
      const normalizedScore = Math.min(Math.round(score), 100);

      return {
        contractor: {
          id: contractor.id,
          name: contractorName,
          rating: null,
          reviewCount: null,
          specialties: contractorSpecialties,
          yearsExperience: null,
          completedProjects: null,
          responseTime: null,
          budgetRange: { min: null, max: null },
          serviceRadius: null,
          location: {
            city: contractor.city,
            state: contractor.state,
            zipCode: contractor.zip_code,
          },
          availability: status === 'active' ? 'available' : 'trial',
          certifications: [],
          userType: contractor.user_type,
        },
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
