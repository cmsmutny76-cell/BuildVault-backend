import { dbQuery } from './db';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: 'homeowner' | 'contractor';
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'homeowner' | 'contractor';
  businessName?: string;
  licenseNumber?: string;
  serviceAreas?: string[];
  specialties?: string[];
}

export const userService = {
  // Create new user (homeowner or contractor)
  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    userType: 'homeowner' | 'contractor';
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);

    if (data.userType === 'contractor') {
      const rows = await dbQuery<any>(
        `INSERT INTO contractors (email, password_hash, first_name, last_name, phone, business_name)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, first_name, last_name, phone, created_at`,
        [data.email.toLowerCase(), passwordHash, data.firstName, data.lastName, data.phone || '', data.firstName]
      );
      return rows[0]
        ? {
            id: String(rows[0].id),
            email: rows[0].email,
            firstName: rows[0].first_name,
            lastName: rows[0].last_name,
            phone: rows[0].phone,
            userType: 'contractor' as const,
            createdAt: rows[0].created_at,
          }
        : null;
    } else {
      const rows = await dbQuery<any>(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, first_name, last_name, phone, created_at`,
        [data.email.toLowerCase(), passwordHash, data.firstName, data.lastName, data.phone || '']
      );
      return rows[0]
        ? {
            id: String(rows[0].id),
            email: rows[0].email,
            firstName: rows[0].first_name,
            lastName: rows[0].last_name,
            phone: rows[0].phone,
            userType: 'homeowner' as const,
            createdAt: rows[0].created_at,
          }
        : null;
    }
  },

  // Find user by email
  async findByEmail(email: string, userType: 'homeowner' | 'contractor' | 'both' = 'both') {
    const table = userType === 'homeowner' ? 'users' : userType === 'contractor' ? 'contractors' : null;

    if (table === null) {
      // Search both tables
      const homeowners = await dbQuery<any>(
        `SELECT id, email, first_name, last_name, phone, 'homeowner' as user_type, created_at FROM users WHERE email = $1`,
        [email.toLowerCase()]
      );
      if (homeowners.length > 0) {
        const row = homeowners[0];
        return {
          id: String(row.id),
          email: row.email,
          firstName: row.first_name,
          lastName: row.last_name,
          phone: row.phone,
          userType: row.user_type as 'homeowner',
          createdAt: row.created_at,
        };
      }

      const contractors = await dbQuery<any>(
        `SELECT id, email, first_name, last_name, phone, 'contractor' as user_type, created_at FROM contractors WHERE email = $1`,
        [email.toLowerCase()]
      );
      if (contractors.length > 0) {
        const row = contractors[0];
        return {
          id: String(row.id),
          email: row.email,
          firstName: row.first_name || '',
          lastName: row.last_name || '',
          phone: row.phone,
          userType: row.user_type as 'contractor',
          createdAt: row.created_at,
        };
      }
      return null;
    } else {
      const rows = await dbQuery<any>(
        `SELECT id, email, first_name, last_name, phone, created_at FROM ${table} WHERE email = $1`,
        [email.toLowerCase()]
      );
      return rows[0]
        ? {
            id: String(rows[0].id),
            email: rows[0].email,
            firstName: rows[0].first_name,
            lastName: rows[0].last_name,
            phone: rows[0].phone,
            userType: (table === 'users' ? 'homeowner' : 'contractor') as 'homeowner' | 'contractor',
            createdAt: rows[0].created_at,
          }
        : null;
    }
  },

  // Get user profile with additional details
  async getProfile(userId: string, userType: 'homeowner' | 'contractor'): Promise<UserProfile | null> {
    const table = userType === 'homeowner' ? 'users' : 'contractors';
    const rows = await dbQuery<any>(
      `SELECT id, email, first_name, last_name, phone, business_name, license_number, service_areas, specialties FROM ${table} WHERE id = $1`,
      [parseInt(userId)]
    );

    if (!rows[0]) return null;

    const row = rows[0];
    return {
      id: String(row.id),
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phone: row.phone || '',
      userType,
      ...(userType === 'contractor' && {
        businessName: row.business_name,
        licenseNumber: row.license_number,
        serviceAreas: row.service_areas || [],
        specialties: row.specialties || [],
      }),
    };
  },

  // Update user profile
  async updateProfile(userId: string, userType: 'homeowner' | 'contractor', data: Partial<UserProfile>) {
    const table = userType === 'homeowner' ? 'users' : 'contractors';
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.firstName) {
      updates.push(`first_name = $${paramIndex++}`);
      params.push(data.firstName);
    }
    if (data.lastName) {
      updates.push(`last_name = $${paramIndex++}`);
      params.push(data.lastName);
    }
    if (data.phone) {
      updates.push(`phone = $${paramIndex++}`);
      params.push(data.phone);
    }

    if (userType === 'contractor') {
      if (data.businessName) {
        updates.push(`business_name = $${paramIndex++}`);
        params.push(data.businessName);
      }
      if (data.licenseNumber) {
        updates.push(`license_number = $${paramIndex++}`);
        params.push(data.licenseNumber);
      }
      if (data.serviceAreas) {
        updates.push(`service_areas = $${paramIndex++}`);
        params.push(data.serviceAreas);
      }
      if (data.specialties) {
        updates.push(`specialties = $${paramIndex++}`);
        params.push(data.specialties);
      }
    }

    if (updates.length === 0) return data;

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(parseInt(userId));

    const query = `UPDATE ${table} SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const rows = await dbQuery<any>(query, params);
    return rows[0] || null;
  },

  // Verify password
  async verifyPassword(userId: string, userType: 'homeowner' | 'contractor', password: string): Promise<boolean> {
    const table = userType === 'homeowner' ? 'users' : 'contractors';
    const rows = await dbQuery<any>(
      `SELECT password_hash FROM ${table} WHERE id = $1`,
      [parseInt(userId)]
    );

    if (!rows[0]) return false;
    return bcrypt.compare(password, rows[0].password_hash);
  },
};
