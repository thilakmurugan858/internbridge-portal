import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';
import { EmployerProfile } from '../models/EmployerProfile';
import { Company } from '../models/Company';
import { Internship } from '../models/Internship';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { AuthService } from '../services/authService';

export const seedDatabase = async (): Promise<void> => {
  console.log('[Seed] Starting database seeding with simulated demo data...');

  // Connect to DB if not connected
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  // Clear existing collections safely
  await Promise.all([
    User.deleteMany({}),
    StudentProfile.deleteMany({}),
    EmployerProfile.deleteMany({}),
    Company.deleteMany({}),
    Internship.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
  ]);

  console.log('[Seed] Cleared existing records.');

  // Create demo users with hashed passwords
  const passwordHash = await AuthService.hashPassword('DemoPassword123!');

  const studentUser = await User.create({
    name: 'Aarav Sharma (Demo Student)',
    email: 'student@internbridge.dev',
    passwordHash,
    role: 'student',
    isVerified: true,
  });

  const employerUser = await User.create({
    name: 'Neha Kapoor (Demo Recruiter)',
    email: 'employer@internbridge.dev',
    passwordHash,
    role: 'employer',
    isVerified: true,
  });

  const adminUser = await User.create({
    name: 'Platform Moderator (Demo Admin)',
    email: 'admin@internbridge.dev',
    passwordHash,
    role: 'admin',
    isVerified: true,
  });

  // Create Student Profile
  await StudentProfile.create({
    userId: studentUser._id,
    phone: '+91 9876543210',
    headline: 'Pre-final Year Computer Science Student | Aspiring Full Stack Developer',
    bio: 'Passionate about modern web technologies, building scalable React applications, and solving distributed systems problems.',
    location: 'Bengaluru, India',
    skills: ['TypeScript', 'React.js', 'Next.js', 'Node.js', 'MongoDB', 'Tailwind CSS', 'Docker'],
    education: [
      {
        institution: 'National Institute of Technology',
        degree: 'Bachelor of Technology (B.Tech)',
        fieldOfStudy: 'Computer Science and Engineering',
        startYear: 2023,
        endYear: 2027,
        grade: '8.8 CGPA',
      },
    ],
    experience: [
      {
        title: 'Open Source Contributor',
        company: 'DevCommunity Projects',
        location: 'Remote',
        startDate: new Date('2024-01-01'),
        isCurrent: true,
        description: 'Contributed UI improvements and bug fixes to open-source developer tooling repositories.',
      },
    ],
    githubUrl: 'https://github.com',
    linkedinUrl: 'https://linkedin.com',
  });

  // Create Demo Companies
  const companies = await Company.create([
    {
      name: 'Apex Digital Labs (Demo)',
      slug: 'apex-digital-labs',
      description: 'Apex Digital Labs creates cutting-edge enterprise cloud platforms and design systems for global businesses.',
      industry: 'Software & Technology',
      companySize: '50-200 employees',
      headquarters: 'Bengaluru, Karnataka',
      foundedYear: 2020,
      verified: true,
    },
    {
      name: 'CloudNova Technologies (Demo)',
      slug: 'cloudnova-technologies',
      description: 'Building modern serverless infrastructure, developer workflows, and automated testing tools.',
      industry: 'Cloud Computing & DevOps',
      companySize: '20-50 employees',
      headquarters: 'Hyderabad, Telangana',
      foundedYear: 2021,
      verified: true,
    },
    {
      name: 'ByteCraft Systems (Demo)',
      slug: 'bytecraft-systems',
      description: 'Fintech product studio engineering micro-investing and automated banking pipelines.',
      industry: 'Financial Technology',
      companySize: '100-500 employees',
      headquarters: 'Mumbai, Maharashtra',
      foundedYear: 2018,
      verified: true,
    },
    {
      name: 'QuantumFin Insights (Demo)',
      slug: 'quantumfin-insights',
      description: 'Quantitative analytics and machine learning forecasting platform for capital markets.',
      industry: 'Data & Artificial Intelligence',
      companySize: '10-30 employees',
      headquarters: 'Pune, Maharashtra',
      foundedYear: 2022,
      verified: true,
    },
  ]);

  // Employer Profile
  await EmployerProfile.create({
    userId: employerUser._id,
    companyId: companies[0]._id,
    designation: 'Head of Talent Acquisition',
    phone: '+91 9988776655',
    isCompanyAdmin: true,
    isVerified: true,
  });

  // Create 8 Demo Internships
  const oneMonthAhead = new Date();
  oneMonthAhead.setDate(oneMonthAhead.getDate() + 30);

  const internshipsData = [
    {
      title: 'Full Stack Web Developer Intern',
      employerId: employerUser._id,
      companyId: companies[0]._id,
      companyName: companies[0].name,
      category: 'Software Engineering',
      location: 'Bengaluru',
      workMode: 'hybrid',
      durationWeeks: 16,
      stipend: { amount: 25000, currency: 'INR', type: 'fixed', period: 'month' },
      openings: 3,
      description: 'Join our core platform engineering team to build scalable features using Next.js, Express, and MongoDB.',
      responsibilities: [
        'Design and implement performant RESTful APIs and modern frontend components.',
        'Collaborate with product designers to translate Figma mockups into clean React code.',
        'Participate in code reviews, write unit tests, and help debug production issues.',
      ],
      skillsRequired: ['React.js', 'Next.js', 'Node.js', 'TypeScript', 'MongoDB'],
      eligibility: ['Available for full-time 4 months hybrid internship', 'Graduating in 2025, 2026, or 2027'],
      perks: ['Certificate of Completion', 'Letter of Recommendation', 'Flexible Hours', 'Pre-Placement Offer (PPO)'],
      deadline: oneMonthAhead,
      startDate: 'Immediately',
      status: 'active',
      viewsCount: 142,
    },
    {
      title: 'Frontend React & UI/UX Intern',
      employerId: employerUser._id,
      companyId: companies[0]._id,
      companyName: companies[0].name,
      category: 'Design & Frontend',
      location: 'Remote',
      workMode: 'remote',
      durationWeeks: 12,
      stipend: { amount: 20000, currency: 'INR', type: 'fixed', period: 'month' },
      openings: 2,
      description: 'Craft responsive, accessible user interfaces and micro-interactions for high-traffic student applications.',
      responsibilities: [
        'Build reusable component libraries with Tailwind CSS and React.',
        'Ensure WCAG AA accessibility compliance across mobile and desktop breakpoints.',
        'Optimize page performance, Core Web Vitals, and client-side rendering bundle sizes.',
      ],
      skillsRequired: ['React.js', 'Tailwind CSS', 'TypeScript', 'HTML5/CSS3'],
      eligibility: ['Open for all college students with a demonstrated frontend project portfolio'],
      perks: ['Certificate', 'Letter of Recommendation', 'Remote Work Flexibility'],
      deadline: oneMonthAhead,
      startDate: 'Immediately',
      status: 'active',
      viewsCount: 98,
    },
    {
      title: 'Cloud DevOps & Site Reliability Intern',
      employerId: employerUser._id,
      companyId: companies[1]._id,
      companyName: companies[1].name,
      category: 'DevOps & Cloud',
      location: 'Hyderabad',
      workMode: 'in_office',
      durationWeeks: 24,
      stipend: { amount: 30000, currency: 'INR', type: 'fixed', period: 'month' },
      openings: 2,
      description: 'Learn modern CI/CD automation, Docker containerization, Kubernetes orchestration, and cloud observability.',
      responsibilities: [
        'Automate container builds and test pipelines with GitHub Actions.',
        'Monitor server logs, health metrics, and configure Prometheus/Grafana dashboards.',
        'Maintain infrastructure-as-code scripts and Docker compose setups.',
      ],
      skillsRequired: ['Docker', 'Linux', 'Git', 'GitHub Actions', 'Python'],
      eligibility: ['Passionate about cloud architecture and automated deployments'],
      perks: ['Certificate', 'Informal Dress Code', 'Free Meals & Snacks', 'PPO Opportunity'],
      deadline: oneMonthAhead,
      startDate: 'Within 2 Weeks',
      status: 'active',
      viewsCount: 84,
    },
    {
      title: 'Machine Learning & Data Science Intern',
      employerId: employerUser._id,
      companyId: companies[3]._id,
      companyName: companies[3].name,
      category: 'Data Science & AI',
      location: 'Remote',
      workMode: 'remote',
      durationWeeks: 12,
      stipend: { amount: 28000, currency: 'INR', type: 'fixed', period: 'month' },
      openings: 1,
      description: 'Apply NLP and collaborative filtering algorithms to improve candidate-job recommendation relevancy.',
      responsibilities: [
        'Preprocess textual dataset features such as skills, job descriptions, and educational histories.',
        'Evaluate recommendation ranking metrics including Precision@k, Recall@k, and NDCG.',
        'Build and document reproducible experiment pipelines.',
      ],
      skillsRequired: ['Python', 'Pandas', 'Scikit-Learn', 'PyTorch', 'Data Analysis'],
      eligibility: ['Strong foundation in probability, statistics, and Python programming'],
      perks: ['Certificate of Merit', 'Research Mentorship', 'Letter of Recommendation'],
      deadline: oneMonthAhead,
      startDate: 'Immediately',
      status: 'active',
      viewsCount: 175,
    },
    {
      title: 'Fintech Backend Engineering Intern',
      employerId: employerUser._id,
      companyId: companies[2]._id,
      companyName: companies[2].name,
      category: 'Software Engineering',
      location: 'Mumbai',
      workMode: 'hybrid',
      durationWeeks: 20,
      stipend: { amount: 35000, currency: 'INR', type: 'fixed', period: 'month' },
      openings: 2,
      description: 'Build fault-tolerant ledger services, transaction verification APIs, and database indexing strategies.',
      responsibilities: [
        'Implement transactional database schemas with rigorous ACID and idempotency guarantees.',
        'Author RESTful documentation and end-to-end integration tests.',
        'Participate in security reviews and database performance profiling.',
      ],
      skillsRequired: ['Node.js', 'Express.js', 'PostgreSQL', 'MongoDB', 'API Security'],
      eligibility: ['Proficient in backend fundamentals and data modeling'],
      perks: ['Top Tier Stipend', 'Corporate Hardware Provided', 'Certificate', 'PPO Opportunity'],
      deadline: oneMonthAhead,
      startDate: 'Immediate',
      status: 'active',
      viewsCount: 210,
    },
    {
      title: 'Product Management & Growth Intern',
      employerId: employerUser._id,
      companyId: companies[0]._id,
      companyName: companies[0].name,
      category: 'Product & Operations',
      location: 'Bengaluru',
      workMode: 'hybrid',
      durationWeeks: 12,
      stipend: { amount: 18000, currency: 'INR', type: 'fixed', period: 'month' },
      openings: 1,
      description: 'Analyze student onboarding funnels, interview active jobseekers, and formulate product spec documents.',
      responsibilities: [
        'Conduct qualitative user research sessions with students and campus placement coordinators.',
        'Define key performance indicators (KPIs) and monitor drop-off rates across application stages.',
        'Draft user stories, wireframes, and release acceptance criteria.',
      ],
      skillsRequired: ['User Research', 'Product Analytics', 'Wireframing', 'Communication'],
      eligibility: ['Strong analytical thinking and user-centric problem solving aptitude'],
      perks: ['Certificate', 'Executive Mentorship', 'Letter of Recommendation'],
      deadline: oneMonthAhead,
      startDate: 'Immediately',
      status: 'active',
      viewsCount: 65,
    },
    {
      title: 'Mobile App Developer Intern (Flutter / React Native)',
      employerId: employerUser._id,
      companyId: companies[1]._id,
      companyName: companies[1].name,
      category: 'Mobile Development',
      location: 'Remote',
      workMode: 'remote',
      durationWeeks: 16,
      stipend: { amount: 22000, currency: 'INR', type: 'fixed', period: 'month' },
      openings: 2,
      description: 'Develop cross-platform mobile apps for Android and iOS providing instantaneous internship push alerts.',
      responsibilities: [
        'Build smooth mobile navigation, offline cache handling, and push notifications.',
        'Integrate biometric authentication and deep link routing.',
      ],
      skillsRequired: ['Flutter', 'Dart', 'React Native', 'Mobile UI Design'],
      eligibility: ['Prior experience publishing or building at least one mobile application'],
      perks: ['Certificate', 'Flexible Work Schedule', 'Pre-Placement Review'],
      deadline: oneMonthAhead,
      startDate: 'Immediately',
      status: 'active',
      viewsCount: 112,
    },
    {
      title: 'Cybersecurity & Application Security Intern',
      employerId: employerUser._id,
      companyId: companies[2]._id,
      companyName: companies[2].name,
      category: 'Security & QA',
      location: 'Mumbai',
      workMode: 'in_office',
      durationWeeks: 12,
      stipend: { amount: 24000, currency: 'INR', type: 'fixed', period: 'month' },
      openings: 1,
      description: 'Perform static application security testing (SAST), vulnerability assessments, and OWASP compliance audits.',
      responsibilities: [
        'Audit authentication headers, CORS origins, and token expiration lifecycles.',
        'Conduct automated vulnerability scans and write remediation guides for engineering teams.',
      ],
      skillsRequired: ['OWASP Top 10', 'Penetration Testing', 'Network Security', 'Linux'],
      eligibility: ['Computer Science or Information Security academic background'],
      perks: ['Certificate', 'Security Certification Sponsorship', 'Letter of Recommendation'],
      deadline: oneMonthAhead,
      startDate: 'Immediately',
      status: 'active',
      viewsCount: 89,
    },
  ];

  const createdInternships = await Internship.create(internshipsData);

  // Create 3 Demo Jobs
  const jobsData = [
    {
      title: 'Junior Full Stack Engineer',
      employerId: employerUser._id,
      companyId: companies[0]._id,
      companyName: companies[0].name,
      category: 'Software Engineering',
      location: 'Bengaluru',
      workMode: 'hybrid',
      jobType: 'full_time',
      experienceYearsMin: 0,
      salary: { min: 600000, max: 900000, currency: 'INR', period: 'year' },
      openings: 4,
      description: 'Entry-level full stack position for recent graduates who possess strong algorithmic fundamentals and web programming experience.',
      responsibilities: [
        'Ship customer-facing features on Next.js web portal.',
        'Build performant REST and GraphQL APIs.',
        'Maintain high code quality and test coverage.',
      ],
      skillsRequired: ['TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker'],
      eligibility: ['B.Tech / MCA / M.Tech in Computer Science or related degree', '0-1 year experience'],
      perks: ['Health Insurance', 'Performance Bonus', 'Stock Options (ESOPs)', 'Annual Learning Stipend'],
      deadline: oneMonthAhead,
      status: 'active',
      viewsCount: 310,
    },
    {
      title: 'Associate Cloud Support Engineer',
      employerId: employerUser._id,
      companyId: companies[1]._id,
      companyName: companies[1].name,
      category: 'DevOps & Cloud',
      location: 'Hyderabad',
      workMode: 'remote',
      jobType: 'full_time',
      experienceYearsMin: 0,
      salary: { min: 550000, max: 800000, currency: 'INR', period: 'year' },
      openings: 2,
      description: 'Troubleshoot infrastructure anomalies, monitor cloud workloads, and assist enterprise customers with cloud onboarding.',
      responsibilities: [
        'Analyze system telemetry and incident logs.',
        'Write automation scripts to remediate repetitive operational tasks.',
      ],
      skillsRequired: ['AWS / GCP Basics', 'Linux Bash Scripting', 'Python', 'Networking'],
      eligibility: ['Graduating batches of 2024 and 2025'],
      perks: ['Home Office Setup Allowance', 'Comprehensive Health Cover', 'Flexible Working'],
      deadline: oneMonthAhead,
      status: 'active',
      viewsCount: 145,
    },
    {
      title: 'Junior Data Analyst',
      employerId: employerUser._id,
      companyId: companies[3]._id,
      companyName: companies[3].name,
      category: 'Data Science & AI',
      location: 'Pune',
      workMode: 'hybrid',
      jobType: 'full_time',
      experienceYearsMin: 0,
      salary: { min: 500000, max: 750000, currency: 'INR', period: 'year' },
      openings: 2,
      description: 'Transform raw product event streams into executive dashboards, cohorts, and predictive business insights.',
      responsibilities: [
        'Write complex SQL queries, window functions, and aggregation transformations.',
        'Build automated reporting dashboards in Tableau or PowerBI.',
      ],
      skillsRequired: ['SQL', 'Python', 'Excel', 'Tableau', 'Data Visualization'],
      eligibility: ['Degree in Statistics, Mathematics, Computer Science, or Economics'],
      perks: ['Hybrid Working', 'Competitive Compensation', 'Gym Membership Reimbursement'],
      deadline: oneMonthAhead,
      status: 'active',
      viewsCount: 180,
    },
  ];

  await Job.create(jobsData);

  // Create 1 Demo Application for the demo student
  await Application.create({
    opportunityId: createdInternships[0]._id,
    opportunityType: 'internship',
    studentId: studentUser._id,
    employerId: employerUser._id,
    companyId: companies[0]._id,
    status: 'in_review',
    coverLetter: 'I am deeply enthusiastic about joining Apex Digital Labs as a Full Stack Web Developer Intern. With hands-on experience in Next.js, Node.js, and TypeScript, I can contribute productively from day one.',
    resumeUrl: 'https://example.com/demo-resumes/aarav-sharma-resume.pdf',
    statusHistory: [
      {
        status: 'applied',
        changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        note: 'Application submitted',
        changedBy: studentUser._id,
      },
      {
        status: 'in_review',
        changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        note: 'Profile matched core skills requirements; forwarded to hiring manager',
        changedBy: employerUser._id,
      },
    ],
  });

  console.log('[Seed] Database seeded successfully!');
  console.log('====================================================');
  console.log('Demo Credentials for Testing:');
  console.log('Student Account:   student@internbridge.dev   / DemoPassword123!');
  console.log('Employer Account:  employer@internbridge.dev  / DemoPassword123!');
  console.log('Admin Account:     admin@internbridge.dev     / DemoPassword123!');
  console.log('====================================================');
};

// Allow standalone execution
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Standalone execution finished. Exiting.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    });
}
