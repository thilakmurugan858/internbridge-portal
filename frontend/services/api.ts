const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; message?: string; meta?: any }> {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(json.message || `Request failed with status ${response.status}`);
      }

      return json;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Network error or backend unavailable',
      };
    }
  }

  // Auth methods
  async register(data: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: any) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Internships
  async getInternships(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return this.request(`/internships?${query.toString()}`);
  }

  async getFeaturedInternships() {
    return this.request('/internships/featured');
  }

  async getCategories() {
    return this.request('/internships/categories');
  }

  async getInternshipById(id: string) {
    return this.request(`/internships/${id}`);
  }

  async createInternship(data: any) {
    return this.request('/internships', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInternship(id: string, data: any) {
    return this.request(`/internships/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteInternship(id: string) {
    return this.request(`/internships/${id}`, { method: 'DELETE' });
  }

  // Jobs
  async getJobs(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return this.request(`/jobs?${query.toString()}`);
  }

  async getJobById(id: string) {
    return this.request(`/jobs/${id}`);
  }

  async createJob(data: any) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Applications
  async apply(data: any) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyApplications() {
    return this.request('/applications/me');
  }

  async withdrawApplication(id: string) {
    return this.request(`/applications/${id}/withdraw`, { method: 'POST' });
  }

  async getEmployerApplications(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return this.request(`/applications/employer?${query.toString()}`);
  }

  async updateApplicationStatus(id: string, status: string, note?: string) {
    return this.request(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  }

  // Companies
  async getCompanies(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return this.request(`/companies?${query.toString()}`);
  }

  async getCompanyByIdentifier(identifier: string) {
    return this.request(`/companies/${identifier}`);
  }

  // Student Profile
  async getStudentProfile() {
    return this.request('/students/me');
  }

  async updateStudentProfile(data: any) {
    return this.request('/students/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Bookmarks / Saved Opportunities
  async getSavedOpportunities() {
    return this.request('/saved-opportunities');
  }

  async saveOpportunity(id: string, type: 'internship' | 'job' = 'internship') {
    return this.request(`/saved-opportunities/${id}`, {
      method: 'POST',
      body: JSON.stringify({ opportunityType: type }),
    });
  }

  async unsaveOpportunity(id: string) {
    return this.request(`/saved-opportunities/${id}`, {
      method: 'DELETE',
    });
  }

  // Reports
  async reportListing(data: any) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  async getAdminReports(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return this.request(`/admin/reports?${query.toString()}`);
  }

  async resolveReport(id: string, data: any) {
    return this.request(`/admin/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getAdminUsers(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return this.request(`/admin/users?${query.toString()}`);
  }

  async verifyCompany(companyId: string, verified: boolean) {
    return this.request('/admin/verify-company', {
      method: 'PATCH',
      body: JSON.stringify({ companyId, verified }),
    });
  }
}

export const api = new ApiClient();
