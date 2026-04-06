#!/usr/bin/env node
/**
 * Seed Test Accounts for BuildVault Beta Testing
 * 
 * This script creates test accounts that beta testers can use.
 * Run with: node backend/scripts/seed-test-accounts.js
 */

const bcrypt = require('bcryptjs');

const TEST_ACCOUNTS = [
  {
    email: 'homeowner@test.com',
    password: 'password123',
    userType: 'homeowner',
    name: 'Test Homeowner',
    phone: '555-0100',
    location: 'Los Angeles, CA',
  },
  {
    email: 'contractor@test.com',
    password: 'password123',
    userType: 'contractor',
    name: 'Test Contractor LLC',
    phone: '555-0200',
    location: 'Los Angeles, CA',
    businessName: 'Test Contractor LLC',
    licenseNumber: 'CA-TEST-12345',
  },
  {
    email: 'employment@test.com',
    password: 'password123',
    userType: 'employment_seeker',
    name: 'Test Employment Seeker',
    phone: '555-0300',
    location: 'Austin, TX',
  },
  {
    email: 'commercialbuilder@test.com',
    password: 'password123',
    userType: 'commercial_builder',
    name: 'Test Commercial Builder',
    phone: '555-0400',
    location: 'Dallas, TX',
  },
  {
    email: 'multifamily@test.com',
    password: 'password123',
    userType: 'multi_family_owner',
    name: 'Test Multi-Family Owner',
    phone: '555-0500',
    location: 'Phoenix, AZ',
  },
  {
    email: 'apartmentowner@test.com',
    password: 'password123',
    userType: 'apartment_owner',
    name: 'Test Apartment Owner',
    phone: '555-0600',
    location: 'Atlanta, GA',
  },
  {
    email: 'developer@test.com',
    password: 'password123',
    userType: 'developer',
    name: 'Test Developer',
    phone: '555-0700',
    location: 'Nashville, TN',
  },
  {
    email: 'landscaper@test.com',
    password: 'password123',
    userType: 'landscaper',
    name: 'Test Landscaper',
    phone: '555-0800',
    location: 'Sacramento, CA',
  },
  {
    email: 'school@test.com',
    password: 'password123',
    userType: 'school',
    name: 'Test Trade School',
    phone: '555-0900',
    location: 'Bakersfield, CA',
  },
];

async function generateHashedAccounts() {
  console.log('🔐 Generating hashed passwords for test accounts...\n');

  for (const account of TEST_ACCOUNTS) {
    const hash = await bcrypt.hash(account.password, 10);
    
    console.log(`📧 ${account.email}`);
    console.log(`   User Type: ${account.userType}`);
    console.log(`   Password: ${account.password}`);
    console.log(`   Hash: ${hash}`);
    console.log('');
  }

  console.log('✅ Copy these hashes to your database seeding script or use the registration API.\n');
}

async function seedViaAPI() {
  console.log('🌱 Seeding test accounts via API...\n');

  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  for (const account of TEST_ACCOUNTS) {
    try {
      const response = await fetch(`${baseURL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: account.email,
          password: account.password,
          userType: account.userType,
          name: account.name,
          phone: account.phone,
          location: account.location,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ Created: ${account.email}`);
      } else {
        console.log(`⚠️  ${account.email}: ${data.error || 'Already exists or error'}`);
      }
    } catch (error) {
      console.error(`❌ Failed to create ${account.email}:`, error.message);
    }
  }

  console.log('\n✅ Test account seeding complete!\n');
}

// Run based on command line argument
const command = process.argv[2] || 'hash';

if (command === 'seed') {
  seedViaAPI().catch(console.error);
} else {
  generateHashedAccounts().catch(console.error);
}

// Export for use in other scripts
module.exports = { TEST_ACCOUNTS, generateHashedAccounts, seedViaAPI };
