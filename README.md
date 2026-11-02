# InternBridge — Internship & Job Discovery Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2+-black.svg)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.21+-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green.svg)](https://mongoosejs.com/)
[![Tests](https://img.shields.io/badge/Tests-34%20Passed-brightgreen.svg)]()

InternBridge is a complete, full-stack recruitment, internship discovery, and community engagement platform inspired by the core capabilities of Internshala. Built from scratch with independent branding, clean modern architecture, and enterprise-grade security.

---

## 🌟 Key Modules & Capabilities

### 🌐 Task 1: Public Space (Community Engagement)
- **Personalized Community Feed (`/public-space`):**
  - **For You:** Multi-tiered feed displaying accepted friends' posts first, trending high-engagement posts next, and recent chronological posts.
  - **Friends Only:** Exclusively posts authored by accepted mutual friends.
  - **Trending:** Posts ranked by engagement score (`likes * 2 + comments * 3 + shares * 4`).
  - **Recent:** Chronological stream of community posts.
- **Friend-Based Daily Posting Limit (Business Rule):**
  - **0 Friends:** 0 posts/day (Posting locked with in-app guidance to add peers).
  - **1 Friend:** 1 post/day.
  - **2–5 Friends:** 2 posts/day.
  - **6–10 Friends:** 5 posts/day.
  - **>10 Friends:** Unlimited posts.
  - *Evaluated strictly server-side in Indian Standard Time (IST, UTC+05:30) with automatic midnight resets.*
- **Rich Post Creation:** Text content, `#hashtags`, `@mentions`, multi-photo and video attachments, and privacy settings (`public`, `friends`, `private`).
- **Interactions:** Likes, comments, attributed shares with commentary, bookmarks/saves, and reports.
- **Separate Friend & Follow Systems:** Mutual friend requests (directly governing post allowance) decoupled from one-way follower subscriptions.
- **User Community Profiles (`/public-space/profile/[username]`):** Cover banner, avatar, metrics (friends, followers, posts), and interactive relationship actions.
- **In-App Notification Center (`/public-space/notifications`):** Real-time bell badge, notifications for likes, comments, friend requests, acceptances, and mentions.
- **Discovery Hub (`/public-space/discovery`):** Peer directory search, incoming friend request manager, and trending hashtag pills.

### 🎓 For Students & Candidates
- **Search & Discovery:** Filter by category, city, work mode (Remote / Hybrid / In-Office), paid/unpaid, stipend range, and duration.
- **Detailed Opportunity View:** Responsibilities, required skills, eligibility, perks, openings, and application deadlines.
- **1-Click Apply Flow:** Submit customized cover letters and attach resume/portfolio links.
- **Duplicate Prevention:** Engine-level compound constraints preventing duplicate applications to the same opportunity.
- **Application Tracking:** Track application review status (`applied` &rarr; `in_review` &rarr; `shortlisted` &rarr; `accepted` / `rejected`).
- **Application Withdrawal:** Candidate agency to withdraw active applications.
- **Bookmarks:** Save opportunities to personal bookmarks for later review.
- **Student Profile:** Maintain education, work history, skills tags, and resume links.

### 💼 For Recruiters & Employers
- **Employer Profile:** Link with verified company entities.
- **Opportunity Publishing:** Post internships and jobs with rich criteria (stipends, duration, skills, openings, deadlines).
- **Candidate Pipeline:** View applicants, read cover letters, inspect skills and resumes.
- **Status Workflow:** Update candidate application stages (`in_review`, `shortlisted`, `accepted`, `rejected`) with stage audit notes.
- **Ownership Protection:** Strict server-side verification ensuring employers cannot view or tamper with other employers' listings.

### 🛡️ For Administrators & Platform Trust
- **Platform Analytics:** Total users, student/recruiter counts, active listings, and application volumes.
- **Listing Moderation:** Review community reports for fraud, misleading claims, or policy violations.
- **Listing Actions:** Issue warnings or disable/remove flagged listings with audit logging.
- **Company Verification:** Verify legitimate employer organizations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js, TypeScript, RESTful JSON APIs |
| **Database** | MongoDB with Mongoose ODM (Schemas, Compound Indexes, Validation) |
| **Security** | Helmet, CORS, Express-Rate-Limit, Bcrypt.js, HttpOnly JWT Cookies, Zod |
| **Testing** | Jest, Supertest, Ts-Jest, MongoMemoryServer |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)
- MongoDB running locally on port 27017 or MongoDB Atlas connection URI

### 2. Install Dependencies
```bash
# In project root
npm run install:all
```

### 3. Seed Demo Data (Includes Community Posts & Demo Friendships)
```bash
npm run seed
```

### 4. Run the Application
Open two terminal windows:

```bash
# Terminal 1: Backend (Port 5000)
npm run dev:backend

# Terminal 2: Frontend (Port 3000)
npm run dev:frontend
```

Visit **`http://localhost:3000`** in your browser. Access Public Space via the top navigation or directly at **`http://localhost:3000/public-space`**.

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email Address | Password | Community Username |
| :--- | :--- | :--- | :--- |
| **Student** | `student@internbridge.dev` | `DemoPassword123!` | `@aarav_sharma` (2 friends, 2 posts/day allowance) |
| **Employer** | `employer@internbridge.dev` | `DemoPassword123!` | `@priya_patel` |
| **Admin** | `admin@internbridge.dev` | `DemoPassword123!` | `@admin` |

*(You can also use the 1-Click Demo Login buttons on the `/login` page)*

---

## 🧪 Automated Testing

InternBridge features comprehensive automated test suites executed with `ts-jest` and `mongodb-memory-server`:
```bash
npm run test:backend
```
**Test Results:** **34 of 34 tests passing (100%)**
- **Public Space Suite (15 tests):** Friend limit enforcement (0 friends blocked, 1 friend allowed 1 post, tier calculation, IST limits), friend request lifecycle, follow/unfollow, post interactions (like, comment, share, save, report), and community feed prioritization.
- **Core Platform Suite (19 tests):** Health check, registration, JWT authentication, listings and keyword search, employer ownership permissions, application lifecycle and duplicate prevention, admin moderation.

---

## 📚 Technical Documentation Roadmap

- [docs/public-space.md](docs/public-space.md) — Public Space architecture, friend limit algorithm, feed ranking, and API specification.
- [docs/architecture.md](docs/architecture.md) — System design, components, and Mermaid sequence diagrams.
- [docs/database-schema.md](docs/database-schema.md) — Schemas, indexes, relationships, and data dictionary.
- [docs/api-documentation.md](docs/api-documentation.md) — Full REST endpoint specifications and payload examples.
- [docs/research-papers.md](docs/research-papers.md) — Verified scholarly references on ORF detection and skill matching.
- [docs/literature-review.md](docs/literature-review.md) — Literature review and feature synthesis.
- [docs/security.md](docs/security.md) — Threat model, defense controls, and deployment hardening.
- [docs/setup-guide.md](docs/setup-guide.md) — Detailed developer installation guide.

---

## 📄 License
This project is an educational and portfolio system design project developed for demonstration purposes.
