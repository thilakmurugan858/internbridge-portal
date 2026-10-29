# InternBridge System Architecture

## 1. High-Level Architectural Overview

InternBridge follows a decoupled, three-tier client-server architecture composed of a Next.js (React 18 + TypeScript) frontend, an Express.js (Node.js + TypeScript) RESTful backend API service, and a MongoDB document database managed via Mongoose ODM.

```mermaid
flowchart TD
    subgraph Client ["Client Tier (Browser)"]
        UI["Next.js App Router (Port 3000)"]
        AC["AuthContext & API Client"]
    end

    subgraph Server ["Backend Service (Port 5000)"]
        EXP["Express REST API"]
        HLM["Security Middleware (Helmet, CORS, Rate Limit)"]
        AUTH["JWT / Cookie Authentication & RBAC"]
        VAL["Zod Request Validation"]
        CTRL["Domain Controllers"]
    end

    subgraph DataTier ["Persistence Tier"]
        MGO[("MongoDB Database (Port 27017)")]
    end

    UI <--> |HTTPS / REST JSON| EXP
    EXP --> HLM --> AUTH --> VAL --> CTRL
    CTRL <--> |Mongoose ODM| MGO
```

---

## 2. Component Responsibilities

### 2.1 Frontend Tier (`frontend/`)
- **Technology:** Next.js (App Router), React 18, TypeScript, Tailwind CSS, Lucide React.
- **Responsibilities:**
  - Client-side and server-side rendering of pages.
  - Interactive faceted filtering and pagination state management with URL parameter reflection.
  - Form validation, candidate application modals, and bookmarking.
  - Secure credential transport (`credentials: 'include'` for HttpOnly cookies and fallback Bearer tokens).
  - Responsive mobile-first interfaces accessible on mobile, tablet, and desktop viewports.

### 2.2 Backend Service Tier (`backend/`)
- **Technology:** Node.js, Express.js, TypeScript.
- **Responsibilities:**
  - RESTful HTTP routing and semantic status code handling.
  - Security hardening via Helmet headers, origin-locked CORS, and IP rate limiting.
  - Cryptographic operations: Bcrypt password hashing (12 salt rounds) and HMAC-SHA256 JWT generation.
  - Role-Based Access Control (RBAC) protecting Student, Employer, and Admin routes.
  - Request payload validation and sanitization using Zod schemas.
  - Centralized error handling preventing stack trace leakage.

### 2.3 Database Tier (`MongoDB`)
- **Technology:** MongoDB 6.0+ with Mongoose schemas.
- **Responsibilities:**
  - Normalized and referenced document collections (`User`, `StudentProfile`, `EmployerProfile`, `Company`, `Internship`, `Job`, `Application`, `SavedOpportunity`, `ListingReport`, `AuditLog`).
  - Compound indexing ensuring query speed and strict uniqueness (e.g. `[opportunityId, studentId]` preventing duplicate applications).

---

## 3. End-to-End Authentication & Application Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Candidate
    participant FE as Next.js Frontend
    participant API as Express API
    participant DB as MongoDB

    Student->>FE: Click "Apply Now" with Cover Letter
    FE->>API: POST /api/applications (JWT Cookie / Header)
    API->>API: Verify JWT & role == 'student'
    API->>DB: Query Application.findOne({ opportunityId, studentId })
    alt Duplicate Exists
        DB-->>API: Existing application found
        API-->>FE: HTTP 409 Conflict ("Already submitted")
        FE-->>Student: Display alert
    else New Application
        DB-->>API: None found
        API->>DB: Application.create({ ... })
        API->>DB: Internship.findByIdAndUpdate(opportunityId, { $inc: { applicationsCount: 1 } })
        DB-->>API: Success
        API-->>FE: HTTP 201 Created
        FE-->>Student: Display confirmation modal
    end
```
