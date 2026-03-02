import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// TODO: Replace with actual database query
// For now, using mock database
const mockUsers = new Map([
  // Example: contractor@test.com / password123
  ['contractor@test.com', {
    id: 'user_1',
    email: 'contractor@test.com',
    passwordHash: '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', // "password123"
    firstName: 'John',
    lastName: 'Builder',
    userType: 'contractor',
    phone: '555-0123',
    createdAt: new Date('2024-01-01'),
    verified: true,
  }],
  ['homeowner@test.com', {
    id: 'user_2',
    email: 'homeowner@test.com',
    passwordHash: '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', // "password123"
    firstName: 'Jane',
    lastName: 'Smith',
    userType: 'homeowner',
    phone: '555-0124',
    createdAt: new Date('2024-01-02'),
    verified: true,
  }],
]);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = mockUsers.get(email.toLowerCase());
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is verified
    if (!user.verified) {
      return NextResponse.json(
        { success: false, error: 'Please verify your email before logging in' },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        userType: user.userType,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        phone: user.phone,
        isContractor: user.userType === 'contractor',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
