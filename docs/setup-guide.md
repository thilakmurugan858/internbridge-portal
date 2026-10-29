# InternBridge Local Setup & Developer Guide

This guide provides clear, step-by-step instructions to run InternBridge locally on Windows, macOS, or Linux.

---

## 1. Prerequisites

- **Node.js:** v18.0.0 or later (tested on v24.13.0)
- **npm:** v9.0.0 or later (tested on v11.6.2)
- **Git:** v2.30.0 or later
- **MongoDB:** Local MongoDB Community Server running on `localhost:27017` OR a free MongoDB Atlas cloud cluster URI.

---

## 2. Project Directory Verification

Ensure you are in the project root directory:
```bash
# On Windows
cd "C:\Users\Thilak Ram\OneDrive\Desktop\internshala webpage"
```

---

## 3. Environment Configuration

### Backend Environment
Copy the example environment file in `backend/`:
```bash
cp backend/.env.example backend/.env
```
Default `backend/.env` contents:
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/internbridge
JWT_SECRET=internbridge_super_secret_jwt_key_2026_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```
*Note: If using MongoDB Atlas, replace `MONGODB_URI` with your connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/internbridge`.*

### Frontend Environment
Copy the example environment file in `frontend/`:
```bash
cp frontend/.env.example frontend/.env.local
```
Default `frontend/.env.local` contents:
```ini
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 4. Install Dependencies

You can install all dependencies from the root directory or inside each service folder:

### Option A: From root
```bash
npm run install:all
```

### Option B: Individual services
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## 5. Seed Demo Data

To populate the database with demo students, recruiters, companies, internships, jobs, and applications:
```bash
npm run seed --prefix backend
```

### Ready-to-Use Demo Accounts:
| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Student** | `student@internbridge.dev` | `DemoPassword123!` |
| **Employer** | `employer@internbridge.dev` | `DemoPassword123!` |
| **Admin** | `admin@internbridge.dev` | `DemoPassword123!` |

*(You can also use the 1-Click Demo buttons on the `/login` page to auto-fill these credentials)*

---

## 6. Running the Application

Open two terminal windows:

### Terminal 1: Backend API Service
```bash
cd backend
npm run dev
```
- Server starts at: `http://localhost:5000`
- API Health Check: `http://localhost:5000/api/health`

### Terminal 2: Next.js Frontend
```bash
cd frontend
npm run dev
```
- Web interface opens at: `http://localhost:3000`

---

## 7. Running Automated Tests & Type Checks

To execute the test suite (19 automated tests covering health check, authentication, duplicate prevention, ownership verification, and moderation):
```bash
cd backend
npm test
```
*Note: Automated tests spin up an embedded in-memory MongoDB server via `mongodb-memory-server` and run isolated from local database state.*

To run production builds:
```bash
# Backend build (TypeScript compilation)
cd backend && npm run build

# Frontend build (Next.js production bundle)
cd frontend && npm run build
```
