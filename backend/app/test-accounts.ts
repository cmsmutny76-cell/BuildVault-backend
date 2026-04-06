// Test user credentials for BuildVault beta testing
// These accounts should be seeded in the database for testing

export const TEST_ACCOUNTS = {
  homeowner: {
    email: 'homeowner@test.com',
    password: 'password123', // Will be hashed with bcrypt
    userType: 'homeowner',
    profile: {
      name: 'Test Homeowner',
      phone: '555-0100',
      location: 'Los Angeles, CA',
      verified: true,
    },
  },
  contractor: {
    email: 'contractor@test.com',
    password: 'password123', // Will be hashed with bcrypt
    userType: 'contractor',
    profile: {
      name: 'Test Contractor LLC',
      phone: '555-0200',
      location: 'Los Angeles, CA',
      businessName: 'Test Contractor LLC',
      licenseNumber: 'CA-TEST-12345',
      verified: true,
      specialties: ['General Contractor', 'Remodeling', 'New Construction'],
      yearsExperience: 15,
    },
  },
  employmentSeeker: {
    email: 'employment@test.com',
    password: 'password123',
    userType: 'employment_seeker',
    profile: {
      name: 'Test Employment Seeker',
      phone: '555-0300',
      location: 'Austin, TX',
      verified: true,
    },
  },
  commercialBuilder: {
    email: 'commercialbuilder@test.com',
    password: 'password123',
    userType: 'commercial_builder',
    profile: {
      name: 'Test Commercial Builder',
      phone: '555-0400',
      location: 'Dallas, TX',
      verified: true,
    },
  },
  multiFamilyOwner: {
    email: 'multifamily@test.com',
    password: 'password123',
    userType: 'multi_family_owner',
    profile: {
      name: 'Test Multi-Family Owner',
      phone: '555-0500',
      location: 'Phoenix, AZ',
      verified: true,
    },
  },
  apartmentOwner: {
    email: 'apartmentowner@test.com',
    password: 'password123',
    userType: 'apartment_owner',
    profile: {
      name: 'Test Apartment Owner',
      phone: '555-0600',
      location: 'Atlanta, GA',
      verified: true,
    },
  },
  developer: {
    email: 'developer@test.com',
    password: 'password123',
    userType: 'developer',
    profile: {
      name: 'Test Developer',
      phone: '555-0700',
      location: 'Nashville, TN',
      verified: true,
    },
  },
  landscaper: {
    email: 'landscaper@test.com',
    password: 'password123',
    userType: 'landscaper',
    profile: {
      name: 'Test Landscaper',
      phone: '555-0800',
      location: 'Sacramento, CA',
      verified: true,
    },
  },
  school: {
    email: 'school@test.com',
    password: 'password123',
    userType: 'school',
    profile: {
      name: 'Test Trade School',
      phone: '555-0900',
      location: 'Bakersfield, CA',
      verified: true,
    },
  },
};

// Hashed passwords (bcrypt with 10 rounds)
// Use these pre-hashed values to seed the database
export const TEST_ACCOUNTS_HASHED = {
  homeowner: {
    email: 'homeowner@test.com',
    // Password: password123
    passwordHash: '$2a$10$X9Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0', // Placeholder - generate real hash
    userType: 'homeowner',
  },
  contractor: {
    email: 'contractor@test.com',
    // Password: password123
    passwordHash: '$2a$10$A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7', // Placeholder - generate real hash
    userType: 'contractor',
  },
  employmentSeeker: {
    email: 'employment@test.com',
    passwordHash: '$2a$10$EMPLOYMENTSEEKERHASHPLACEHOLDER0000000000000000000',
    userType: 'employment_seeker',
  },
  commercialBuilder: {
    email: 'commercialbuilder@test.com',
    passwordHash: '$2a$10$COMMERCIALBUILDERHASHPLACEHOLDER0000000000000000',
    userType: 'commercial_builder',
  },
  multiFamilyOwner: {
    email: 'multifamily@test.com',
    passwordHash: '$2a$10$MULTIFAMILYOWNERHASHPLACEHOLDER00000000000000000',
    userType: 'multi_family_owner',
  },
  apartmentOwner: {
    email: 'apartmentowner@test.com',
    passwordHash: '$2a$10$APARTMENTOWNERHASHPLACEHOLDER000000000000000000',
    userType: 'apartment_owner',
  },
  developer: {
    email: 'developer@test.com',
    passwordHash: '$2a$10$DEVELOPERHASHPLACEHOLDER000000000000000000000000',
    userType: 'developer',
  },
  landscaper: {
    email: 'landscaper@test.com',
    passwordHash: '$2a$10$LANDSCAPERHASHPLACEHOLDER00000000000000000000000',
    userType: 'landscaper',
  },
  school: {
    email: 'school@test.com',
    passwordHash: '$2a$10$SCHOOLHASHPLACEHOLDER000000000000000000000000000',
    userType: 'school',
  },
};

// Instructions for seeding:
// 1. Run backend with npm run dev
// 2. Use the /api/users/register endpoint to create these accounts
// 3. Or manually insert into database with hashed passwords
// 4. Ensure email_verified is set to true for both

/*
SQL to seed test accounts (PostgreSQL):

-- Homeowner test account
INSERT INTO users (email, password_hash, user_type, name, phone, location, email_verified, created_at)
VALUES (
  'homeowner@test.com',
  '$2a$10$[GENERATE_REAL_HASH]',
  'homeowner',
  'Test Homeowner',
  '555-0100',
  'Los Angeles, CA',
  true,
  NOW()
);

-- Contractor test account
INSERT INTO users (email, password_hash, user_type, name, phone, location, email_verified, created_at)
VALUES (
  'contractor@test.com',
  '$2a$10$[GENERATE_REAL_HASH]',
  'contractor',
  'Test Contractor LLC',
  '555-0200',
  'Los Angeles, CA',
  true,
  NOW()
);

-- Add contractor profile details
INSERT INTO contractors (user_id, business_name, license_number, specialties, years_experience, verified)
SELECT 
  id, 
  'Test Contractor LLC',
  'CA-TEST-12345',
  ARRAY['General Contractor', 'Remodeling', 'New Construction'],
  15,
  true
FROM users WHERE email = 'contractor@test.com';
*/
