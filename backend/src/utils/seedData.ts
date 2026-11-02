import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { StudentProfile } from '../models/StudentProfile';
import { EmployerProfile } from '../models/EmployerProfile';
import { Company } from '../models/Company';
import { Internship } from '../models/Internship';
import { Job } from '../models/Job';
import { Application } from '../models/Application';
import { Post } from '../models/Post';
import { PostLike } from '../models/PostLike';
import { PostComment } from '../models/PostComment';
import { PostShare } from '../models/PostShare';
import { SavedPost } from '../models/SavedPost';
import { PostReport } from '../models/PostReport';
import { Friendship } from '../models/Friendship';
import { Follow } from '../models/Follow';
import { CommunityNotification } from '../models/CommunityNotification';
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
    Post.deleteMany({}),
    PostLike.deleteMany({}),
    PostComment.deleteMany({}),
    PostShare.deleteMany({}),
    SavedPost.deleteMany({}),
    PostReport.deleteMany({}),
    Friendship.deleteMany({}),
    Follow.deleteMany({}),
    CommunityNotification.deleteMany({}),
  ]);

  console.log('[Seed] Cleared existing records.');

  // Create demo users with hashed passwords
  const passwordHash = await AuthService.hashPassword('DemoPassword123!');

  const studentUser = await User.create({
    name: 'Aarav Sharma (Demo Student)',
    email: 'student@internbridge.dev',
    username: 'aarav_sharma',
    passwordHash,
    role: 'student',
    isVerified: true,
    bio: 'Pre-final Year Computer Science Student | Aspiring Full Stack Developer',
    location: 'Bengaluru, India',
  });

  const employerUser = await User.create({
    name: 'Neha Kapoor (Demo Recruiter)',
    email: 'employer@internbridge.dev',
    username: 'neha_recruiter',
    passwordHash,
    role: 'employer',
    isVerified: true,
    bio: 'Head of Talent Acquisition @ Apex Digital Labs | Hiring young tech minds',
    location: 'Bengaluru, India',
  });

  const adminUser = await User.create({
    name: 'Platform Moderator (Demo Admin)',
    email: 'admin@internbridge.dev',
    username: 'platform_moderator',
    passwordHash,
    role: 'admin',
    isVerified: true,
    bio: 'InternBridge Safety & Trust Operations',
  });

  // Additional student community members
  const peer1 = await User.create({
    name: 'Rohit Kumar',
    email: 'rohit@internbridge.dev',
    username: 'rohit_kumar',
    passwordHash,
    role: 'student',
    isVerified: true,
    bio: 'Backend enthusiast & Cloud architecture learner | CSE @ IIT Bombay',
    location: 'Mumbai, India',
  });

  const peer2 = await User.create({
    name: 'Priya Singh',
    email: 'priya@internbridge.dev',
    username: 'priya_singh',
    passwordHash,
    role: 'student',
    isVerified: true,
    bio: 'Frontend developer & UI/UX explorer | React & Next.js contributor',
    location: 'Delhi, India',
  });

  const peer3 = await User.create({
    name: 'Vikram Dev',
    email: 'vikram@internbridge.dev',
    username: 'vikram_dev',
    passwordHash,
    role: 'student',
    isVerified: false,
    bio: 'Machine Learning student | Python & Data Analytics',
    location: 'Hyderabad, India',
  });

  // Create Student Profile for studentUser
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

  // Demo Internships
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
  ];

  const createdInternships = await Internship.create(internshipsData);

  // Demo Application
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

  // ==========================================
  // PUBLIC SPACE DEMO SEEDING
  // ==========================================
  console.log('[Seed] Seeding Public Space relationships, posts, and interactions...');

  // Friendships:
  // aarav_sharma has 2 accepted friends (rohit_kumar, priya_singh) => Daily Limit = 2 posts
  // vikram_dev has sent a pending request to aarav_sharma
  await Friendship.create([
    {
      requester: studentUser._id,
      recipient: peer1._id,
      status: 'accepted',
    },
    {
      requester: peer2._id,
      recipient: studentUser._id,
      status: 'accepted',
    },
    {
      requester: peer3._id,
      recipient: studentUser._id,
      status: 'pending',
    },
  ]);

  // Follows:
  await Follow.create([
    { follower: peer1._id, following: studentUser._id },
    { follower: studentUser._id, following: peer2._id },
    { follower: peer3._id, following: studentUser._id },
  ]);

  // Public Space Posts:
  const post1 = await Post.create({
    userId: peer1._id,
    authorName: peer1.name,
    username: peer1.username,
    authorAvatar: '',
    friendCountAtPost: 1,
    content: 'Thrilled to share that I just accepted an offer for a Backend Engineering Intern position! Huge thanks to @aarav_sharma for reviewing my mock system design and resume. #internship #career #backend #software',
    mediaUrls: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'],
    mediaType: 'image',
    privacy: 'public',
    likesCount: 14,
    commentsCount: 3,
    sharesCount: 2,
    viewsCount: 145,
    hashtags: ['internship', 'career', 'backend', 'software'],
    mentionedUserIds: [studentUser._id],
    mentionedUsernames: ['aarav_sharma'],
    status: 'active',
  });

  const post2 = await Post.create({
    userId: peer2._id,
    authorName: peer2.name,
    username: peer2.username,
    authorAvatar: '',
    friendCountAtPost: 1,
    content: 'Building an accessible design system with React 18, Tailwind CSS, and Radix primitives this week. What are your favorite UI libraries for student hackathons? #frontend #react #webdev #uiux',
    mediaUrls: [],
    mediaType: 'text',
    privacy: 'public',
    likesCount: 8,
    commentsCount: 2,
    sharesCount: 1,
    viewsCount: 89,
    hashtags: ['frontend', 'react', 'webdev', 'uiux'],
    mentionedUserIds: [],
    mentionedUsernames: [],
    status: 'active',
  });

  const post3 = await Post.create({
    userId: employerUser._id,
    authorName: employerUser.name,
    username: employerUser.username,
    authorAvatar: '',
    friendCountAtPost: 0,
    content: 'Recruiter Tip: When applying to our technical internships, highlight actual project outcomes rather than long lists of keywords. A clean GitHub repository speaks volumes! #hiring #interview #tips',
    mediaUrls: [],
    mediaType: 'text',
    privacy: 'public',
    likesCount: 29,
    commentsCount: 5,
    sharesCount: 8,
    viewsCount: 310,
    hashtags: ['hiring', 'interview', 'tips'],
    mentionedUserIds: [],
    mentionedUsernames: [],
    status: 'active',
  });

  // Initial Post by Student Aarav (Friend count = 2 at posting time, used 1 post today)
  const studentPost = await Post.create({
    userId: studentUser._id,
    authorName: studentUser.name,
    username: studentUser.username,
    authorAvatar: '',
    friendCountAtPost: 2,
    content: 'Deep diving into MongoDB compound index performance and query execution plans today. Any recommendations on books for scalable database architecture? #mongodb #database #backend',
    mediaUrls: [],
    mediaType: 'text',
    privacy: 'public',
    likesCount: 6,
    commentsCount: 1,
    sharesCount: 0,
    viewsCount: 62,
    hashtags: ['mongodb', 'database', 'backend'],
    mentionedUserIds: [],
    mentionedUsernames: [],
    status: 'active',
  });

  // Sample Comments
  await PostComment.create([
    {
      postId: post1._id,
      userId: studentUser._id,
      authorName: studentUser.name,
      username: studentUser.username,
      content: 'Congratulations Rohit! Super well deserved, you put in the hard work!',
    },
    {
      postId: post1._id,
      userId: peer2._id,
      authorName: peer2.name,
      username: peer2.username,
      content: 'Congrats Rohit! Let us celebrate soon! 🎉',
    },
    {
      postId: studentPost._id,
      userId: peer1._id,
      authorName: peer1.name,
      username: peer1.username,
      content: 'Check out "Designing Data-Intensive Applications" by Martin Kleppmann! Absolute gold standard.',
    },
  ]);

  // Sample Likes
  await PostLike.create([
    { postId: post1._id, userId: studentUser._id },
    { postId: post2._id, userId: studentUser._id },
    { postId: studentPost._id, userId: peer1._id },
  ]);

  // Sample Notifications for studentUser
  await CommunityNotification.create([
    {
      recipient: studentUser._id,
      sender: peer1._id,
      type: 'mention',
      postId: post1._id,
      postContentSnippet: post1.content.slice(0, 80),
      read: false,
    },
    {
      recipient: studentUser._id,
      sender: peer1._id,
      type: 'comment',
      postId: studentPost._id,
      postContentSnippet: 'Check out "Designing Data-Intensive Applications"...',
      read: false,
    },
    {
      recipient: studentUser._id,
      sender: peer3._id,
      type: 'friend_request',
      read: false,
    },
  ]);

  console.log('[Seed] Database seeded successfully!');
  console.log('====================================================');
  console.log('Demo Credentials for Testing:');
  console.log('Student Account:   student@internbridge.dev   / DemoPassword123! (@aarav_sharma)');
  console.log('Employer Account:  employer@internbridge.dev  / DemoPassword123! (@neha_recruiter)');
  console.log('Admin Account:     admin@internbridge.dev     / DemoPassword123! (@platform_moderator)');
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
