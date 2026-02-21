import { NextRequest, NextResponse } from 'next/server';

interface Material {
  name: string;
  quantity: string;
  unit: string;
}

interface RetailerPrice {
  retailer: string;
  price: number;
  url: string;
  inStock: boolean;
}

/**
 * POST /api/quotes/generate
 * Generate material quote with pricing from retailers
 */
export async function POST(request: NextRequest) {
  try {
    const { materials, projectType, zipCode } = await request.json();

    if (!materials || !Array.isArray(materials)) {
      return NextResponse.json(
        { error: 'Materials list is required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual price scraping
    // For MVP, use mock pricing data
    const quotedMaterials = materials.map((material: Material) => {
      const basePrice = Math.random() * 100 + 20;
      
      return {
        ...material,
        prices: [
          {
            retailer: 'Home Depot',
            price: basePrice,
            url: 'https://www.homedepot.com/search?q=' + encodeURIComponent(material.name),
            inStock: true,
          },
          {
            retailer: 'Lowes',
            price: basePrice * 0.95,
            url: 'https://www.lowes.com/search?searchTerm=' + encodeURIComponent(material.name),
            inStock: true,
          },
          {
            retailer: 'Ace Hardware',
            price: basePrice * 1.05,
            url: 'https://www.acehardware.com/search?query=' + encodeURIComponent(material.name),
            inStock: Math.random() > 0.3,
          },
        ],
        bestPrice: basePrice * 0.95,
        bestRetailer: 'Lowes',
      };
    });

    const totalCost = quotedMaterials.reduce(
      (sum: number, item: any) => sum + item.bestPrice,
      0
    );

    const quote = {
      id: Date.now(),
      projectType,
      zipCode,
      materials: quotedMaterials,
      totalCost: totalCost.toFixed(2),
      generatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      note: 'Prices are estimates and may vary. Please verify current pricing with retailers.',
    };

    return NextResponse.json({
      success: true,
      quote,
    });
  } catch (error) {
    console.error('Quote generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quote' },
      { status: 500 }
    );
  }
}
