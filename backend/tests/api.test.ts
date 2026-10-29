import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { Company } from '../src/models/Company';
import { EmployerProfile } from '../src/models/EmployerProfile';
import { Internship } from '../src/models/Internship';
import { Application } from '../src/models/Application';
import { AuthService } from '../src/services/authService';

const app = createApp();

describe('InternBridge API Suite', () => {
  let studentToken: string;
  let studentId: string;
  let employerToken: string;
  let employerId: string;
  let otherEmployerToken: string;
  let otherEmployerId: string;
  let adminToken: string;
  let companyId: string;
  let testInternshipId: string;

  beforeEach(async () => {
    // Setup test users & company
    const hash = await AuthService.hashPassword('Password123!');

    const company = await Company.create({
      name: 'Test Labs',
      slug: 'test-labs',
      description: 'Test company description',
      industry: 'Technology',
      verified: true,
    });
    companyId = company._id.toString();

    // Student User
    const student = await User.create({
      name: 'Alice Student',
      email: 'alice@student.test',
      passwordHash: hash,
      role: 'student',
      isVerified: true,
    });
    studentId = student._id.toString();
    studentToken = AuthService.generateToken({
      userId: studentId,
      email: student.email,
      role: 'student',
    });

    // Employer User 1
    const employer = await User.create({
      name: 'Bob Employer',
      email: 'bob@employer.test',
      passwordHash: hash,
      role: 'employer',
      isVerified: true,
    });
    employerId = employer._id.toString();
    employerToken = AuthService.generateToken({
      userId: employerId,
      email: employer.email,
      role: 'employer',
    });
    await EmployerProfile.create({
      userId: employer._id,
      companyId: company._id,
      designation: 'Lead Recruiter',
    });

    // Employer User 2 (Different employer for ownership tests)
    const otherEmployer = await User.create({
      name: 'Charlie Recruiter',
      email: 'charlie@other.test',
      passwordHash: hash,
      role: 'employer',
      isVerified: true,
    });
    otherEmployerId = otherEmployer._id.toString();
    otherEmployerToken = AuthService.generateToken({
      userId: otherEmployerId,
      email: otherEmployer.email,
      role: 'employer',
    });

    // Admin User
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@platform.test',
      passwordHash: hash,
      role: 'admin',
      isVerified: true,
    });
    adminToken = AuthService.generateToken({
      userId: admin._id.toString(),
      email: admin.email,
      role: 'admin',
    });

    // Create an initial active internship owned by Employer 1
    const internship = await Internship.create({
      title: 'Full Stack Engineer Intern',
      employerId: employer._id,
      companyId: company._id,
      companyName: company.name,
      category: 'Software Engineering',
      location: 'Bengaluru',
      workMode: 'remote',
      durationWeeks: 12,
      stipend: { amount: 20000, currency: 'INR', type: 'fixed', period: 'month' },
      openings: 2,
      description: 'Comprehensive full stack internship description over twenty characters.',
      responsibilities: ['Write code', 'Test components'],
      skillsRequired: ['React', 'Node.js', 'TypeScript'],
      eligibility: ['College student'],
      perks: ['Certificate'],
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      startDate: 'Immediately',
      status: 'active',
    });
    testInternshipId = internship._id.toString();
  });

  describe('1. Health Check Endpoint', () => {
    it('GET /api/health should return 200 and healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
    });
  });

  describe('2. Authentication Workflows', () => {
    it('POST /api/auth/register should create a new student account', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'SecurePassword123!',
          role: 'student',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('jane@example.com');
      expect(res.body.data.user.role).toBe('student');
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('POST /api/auth/register should reject duplicate email registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Alice',
          email: 'alice@student.test',
          password: 'SecurePassword123!',
          role: 'student',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('POST /api/auth/login should authenticate valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alice@student.test',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('POST /api/auth/login should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'alice@student.test',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me should return current user info when authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('alice@student.test');
    });

    it('GET /api/auth/me should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('3. Listings, Search and Filters', () => {
    it('GET /api/internships should retrieve active listings with pagination', async () => {
      const res = await request(app).get('/api/internships');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta.total).toBe(1);
    });

    it('GET /api/internships should filter by search keyword', async () => {
      const matchRes = await request(app).get('/api/internships?search=React');
      expect(matchRes.status).toBe(200);
      expect(matchRes.body.data.length).toBe(1);

      const noMatchRes = await request(app).get('/api/internships?search=NonExistentSkillXYZ');
      expect(noMatchRes.status).toBe(200);
      expect(noMatchRes.body.data.length).toBe(0);
    });

    it('GET /api/internships/:id should retrieve details and increment view count', async () => {
      const res = await request(app).get(`/api/internships/${testInternshipId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Full Stack Engineer Intern');
      expect(res.body.data.viewsCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('4. Role-Based Access Controls and Employer Restrictions', () => {
    it('POST /api/internships should reject creation by students (403)', async () => {
      const res = await request(app)
        .post('/api/internships')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Student Attempting Employer Listing',
          category: 'Software Engineering',
          location: 'Remote',
          workMode: 'remote',
          durationWeeks: 8,
          stipendAmount: 10000,
          description: 'This is a description that is longer than twenty characters long.',
          responsibilities: ['Do something'],
          skillsRequired: ['Git'],
          deadline: new Date(Date.now() + 86400000).toISOString(),
        });

      expect(res.status).toBe(403);
    });

    it('PATCH /api/internships/:id should reject update from an employer who does not own the listing', async () => {
      const res = await request(app)
        .patch(`/api/internships/${testInternshipId}`)
        .set('Authorization', `Bearer ${otherEmployerToken}`)
        .send({
          title: 'Unauthorized Hijack Attempt',
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('do not own');
    });

    it('PATCH /api/internships/:id should allow the listing owner to update it', async () => {
      const res = await request(app)
        .patch(`/api/internships/${testInternshipId}`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          title: 'Updated Full Stack Engineer Intern Title',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Full Stack Engineer Intern Title');
    });
  });

  describe('5. Application Lifecycles & Duplicate Prevention', () => {
    it('POST /api/applications should allow student to apply to an active internship', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          opportunityId: testInternshipId,
          opportunityType: 'internship',
          coverLetter: 'I am excited to apply for this full stack role.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('applied');
    });

    it('POST /api/applications should reject duplicate applications to the same opportunity (409)', async () => {
      // First application
      await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          opportunityId: testInternshipId,
          opportunityType: 'internship',
          coverLetter: 'First application.',
        });

      // Second application attempt
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          opportunityId: testInternshipId,
          opportunityType: 'internship',
          coverLetter: 'Duplicate application attempt.',
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already submitted');
    });

    it('PATCH /api/applications/:id/status should allow the listing employer to update status', async () => {
      // Create application
      const appDoc = await Application.create({
        opportunityId: testInternshipId,
        opportunityType: 'internship',
        studentId,
        employerId,
        companyId,
        status: 'applied',
        statusHistory: [{ status: 'applied', changedAt: new Date() }],
      });

      const res = await request(app)
        .patch(`/api/applications/${appDoc._id}/status`)
        .set('Authorization', `Bearer ${employerToken}`)
        .send({
          status: 'shortlisted',
          note: 'Impressive GitHub portfolio',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('shortlisted');
      expect(res.body.data.statusHistory.length).toBe(2);
    });

    it('POST /api/applications/:id/withdraw should allow student to withdraw application', async () => {
      const appDoc = await Application.create({
        opportunityId: testInternshipId,
        opportunityType: 'internship',
        studentId,
        employerId,
        companyId,
        status: 'applied',
        statusHistory: [{ status: 'applied', changedAt: new Date() }],
      });

      const res = await request(app)
        .post(`/api/applications/${appDoc._id}/withdraw`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('withdrawn');
    });
  });

  describe('6. Admin Platform Moderation', () => {
    it('GET /api/admin/stats should reject non-admin access', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    it('GET /api/admin/stats should return platform counts for admin', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(4);
      expect(res.body.data.totalInternships).toBeGreaterThanOrEqual(1);
    });
  });
});
