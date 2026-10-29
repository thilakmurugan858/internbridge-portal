# InternBridge — Internship & Job Discovery Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2+-black.svg)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.21+-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green.svg)](https://mongoosejs.com/)
[![Tests](https://img.shields.io/badge/Tests-19%20Passed-brightgreen.svg)]()

InternBridge is a complete, full-stack recruitment and internship discovery platform inspired by the core capabilities of Internshala. Built from scratch with independent branding, clean modern architecture, and enterprise-grade security.

---

## 🌟 Key Features

### 🎓 For Students & Candidates
- **Search & Discovery:** Filter by category, city, work mode (Remote / Hybrid / In-Office), paid/unpaid, stipend range, and duration.
- **Detailed Opportunity View:** Responsibilities, required skills, eligibility, perks, openings, and application deadlines.
- **1-Click Apply Flow:** Submit customized cover letters and attach resume/portfolio links.
- **Duplicate Prevention:** Engine-level compound constraints preventing accidental duplicate applications to the same listing.
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

### 3. Seed Demo Data
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

Visit **`http://localhost:3000`** in your browser.

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Student** | `student@internbridge.dev` | `DemoPassword123!` |
| **Employer** | `employer@internbridge.dev` | `DemoPassword123!` |
| **Admin** | `admin@internbridge.dev` | `DemoPassword123!` |

*(You can also use the 1-Click Demo Login buttons on the `/login` page)*

---

## 🧪 Automated Testing

InternBridge features an automated test suite executed with `ts-jest` and `mongodb-memory-server`:
```bash
npm run test:backend
```
**Test Results:** 19 of 19 tests passed (Health endpoint, authentication, authorization, listing retrieval, search filters, duplicate application prevention, employer ownership restrictions, status transitions, and moderation).

---

## 📚 Technical Documentation Roadmap

Complete technical architecture and research documentation is available in the `docs/` folder:
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
