import { dbQuery } from './db';

export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  projectType: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status: 'draft' | 'quoted' | 'matched' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialQuote {
  id: string;
  projectId: string;
  quoteData: Record<string, any>;
  totalAmount: number;
  retailerPrices?: Record<string, any>;
  generatedAt: Date;
  expiresAt?: Date;
}

export const projectService = {
  // Create new project
  async createProject(data: {
    userId: string;
    title: string;
    description?: string;
    projectType: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }): Promise<Project | null> {
    const rows = await dbQuery<any>(
      `INSERT INTO projects (user_id, title, description, project_type, address, city, state, zip_code, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'draft')
       RETURNING id, user_id, title, description, project_type, address, city, state, zip_code, status, created_at, updated_at`,
      [
        parseInt(data.userId),
        data.title,
        data.description || null,
        data.projectType,
        data.address || null,
        data.city || null,
        data.state || null,
        data.zipCode || null,
      ]
    );

    return rows[0]
      ? {
          id: String(rows[0].id),
          userId: String(rows[0].user_id),
          title: rows[0].title,
          description: rows[0].description,
          projectType: rows[0].project_type,
          address: rows[0].address,
          city: rows[0].city,
          state: rows[0].state,
          zipCode: rows[0].zip_code,
          status: rows[0].status,
          createdAt: rows[0].created_at,
          updatedAt: rows[0].updated_at,
        }
      : null;
  },

  // Get project by ID
  async getProject(projectId: string): Promise<Project | null> {
    const rows = await dbQuery<any>(
      `SELECT id, user_id, title, description, project_type, address, city, state, zip_code, status, created_at, updated_at
       FROM projects WHERE id = $1`,
      [parseInt(projectId)]
    );

    return rows[0]
      ? {
          id: String(rows[0].id),
          userId: String(rows[0].user_id),
          title: rows[0].title,
          description: rows[0].description,
          projectType: rows[0].project_type,
          address: rows[0].address,
          city: rows[0].city,
          state: rows[0].state,
          zipCode: rows[0].zip_code,
          status: rows[0].status,
          createdAt: rows[0].created_at,
          updatedAt: rows[0].updated_at,
        }
      : null;
  },

  // Get all projects for a user
  async getProjectsByUserId(userId: string): Promise<Project[]> {
    const rows = await dbQuery<any>(
      `SELECT id, user_id, title, description, project_type, address, city, state, zip_code, status, created_at, updated_at
       FROM projects WHERE user_id = $1 ORDER BY created_at DESC`,
      [parseInt(userId)]
    );

    return rows.map((row) => ({
      id: String(row.id),
      userId: String(row.user_id),
      title: row.title,
      description: row.description,
      projectType: row.project_type,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  // Update project
  async updateProject(projectId: string, data: Partial<Project>): Promise<Project | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.title) {
      updates.push(`title = $${paramIndex++}`);
      params.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(data.description || null);
    }
    if (data.status) {
      updates.push(`status = $${paramIndex++}`);
      params.push(data.status);
    }

    if (updates.length === 0) return this.getProject(projectId);

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(parseInt(projectId));

    const query = `UPDATE projects SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const rows = await dbQuery<any>(query, params);
    return rows[0]
      ? {
          id: String(rows[0].id),
          userId: String(rows[0].user_id),
          title: rows[0].title,
          description: rows[0].description,
          projectType: rows[0].project_type,
          address: rows[0].address,
          city: rows[0].city,
          state: rows[0].state,
          zipCode: rows[0].zip_code,
          status: rows[0].status,
          createdAt: rows[0].created_at,
          updatedAt: rows[0].updated_at,
        }
      : null;
  },

  // Store material quote
  async saveQuote(data: {
    projectId: string;
    quoteData: Record<string, any>;
    totalAmount: number;
    retailerPrices?: Record<string, any>;
  }): Promise<MaterialQuote | null> {
    const rows = await dbQuery<any>(
      `INSERT INTO material_quotes (project_id, quote_data, total_amount, retailer_prices, generated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING id, project_id, quote_data, total_amount, retailer_prices, generated_at, expires_at`,
      [
        parseInt(data.projectId),
        JSON.stringify(data.quoteData),
        data.totalAmount,
        data.retailerPrices ? JSON.stringify(data.retailerPrices) : null,
      ]
    );

    return rows[0]
      ? {
          id: String(rows[0].id),
          projectId: String(rows[0].project_id),
          quoteData: rows[0].quote_data,
          totalAmount: rows[0].total_amount,
          retailerPrices: rows[0].retailer_prices,
          generatedAt: rows[0].generated_at,
          expiresAt: rows[0].expires_at,
        }
      : null;
  },

  // Get quotes for a project
  async getQuotes(projectId: string): Promise<MaterialQuote[]> {
    const rows = await dbQuery<any>(
      `SELECT id, project_id, quote_data, total_amount, retailer_prices, generated_at, expires_at
       FROM material_quotes WHERE project_id = $1 ORDER BY generated_at DESC`,
      [parseInt(projectId)]
    );

    return rows.map((row) => ({
      id: String(row.id),
      projectId: String(row.project_id),
      quoteData: row.quote_data,
      totalAmount: row.total_amount,
      retailerPrices: row.retailer_prices,
      generatedAt: row.generated_at,
      expiresAt: row.expires_at,
    }));
  },
};
