# InternBridge REST API Documentation

Base URL: `http://localhost:5000/api`

All responses follow a consistent JSON envelope format:
```json
{
  "success": true,
  "data": {},
  "message": "Optional descriptive status message",
  "meta": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 }
}
```

---

## 1. System Health
### `GET /health`
- **Auth:** Public
- **Description:** Returns server uptime and operational status.
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 142.5,
    "timestamp": "2026-10-29T18:00:00.000Z",
    "service": "InternBridge API"
  }
}
```

---

## 2. Authentication & Identity
### `POST /auth/register`
- **Auth:** Public (Rate limited)
- **Body:**
```json
{
  "name": "Aarav Sharma",
  "email": "student@internbridge.dev",
  "password": "SecurePassword123!",
  "role": "student"
}
```
*Note: For employers, `role` is `"employer"`, and `companyName` is required.*
- **Response (201 Created):** Sets HttpOnly `token` cookie and returns user data + token.

### `POST /auth/login`
- **Auth:** Public (Rate limited)
- **Body:**
```json
{
  "email": "student@internbridge.dev",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "6721590ab...",
      "name": "Aarav Sharma",
      "email": "student@internbridge.dev",
      "role": "student",
      "isVerified": true
    },
    "token": "eyJhbGciOiJIUzI1..."
  },
  "message": "Login successful"
}
```

### `POST /auth/logout`
- **Auth:** Public
- **Description:** Clears session cookie.

### `GET /auth/me`
- **Auth:** Required (Any role)
- **Description:** Returns profile and identity for active session.

---

## 3. Internships
### `GET /internships`
- **Auth:** Public
- **Query Parameters:**
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `search` (string: keyword matching title, company, skills)
  - `category` (string: exact category match)
  - `location` (string: city or remote)
  - `workMode` (`remote` | `hybrid` | `in_office`)
  - `paidOnly` (`true` | `false`)
  - `minStipend` (number)
  - `duration` (number: max weeks)
  - `sortBy` (`newest` | `stipend_desc` | `stipend_asc` | `deadline`)
- **Response (200 OK):** Paginated array of active listings.

### `GET /internships/:id`
- **Auth:** Public
- **Description:** Retrieves single internship details and increments `viewsCount`.

### `POST /internships`
- **Auth:** Required (`employer` or `admin`)
- **Body:** Full internship payload (title, category, location, workMode, durationWeeks, stipendAmount, openings, description, responsibilities, skillsRequired, deadline).
- **Response (201 Created)**

### `PATCH /internships/:id`
- **Auth:** Required (Must be listing owner or `admin`)
- **Response (200 OK)**

### `DELETE /internships/:id`
- **Auth:** Required (Must be listing owner or `admin`)
- **Description:** Archives listing (`status = 'archived'`).

---

## 4. Jobs
### `GET /jobs`
- **Auth:** Public
- **Query Parameters:** `page`, `limit`, `search`, `jobType`, `workMode`, `sortBy`.

### `GET /jobs/:id`
- **Auth:** Public

### `POST /jobs`
- **Auth:** Required (`employer` or `admin`)

---

## 5. Candidate Applications
### `POST /applications`
- **Auth:** Required (`student` only)
- **Body:**
```json
{
  "opportunityId": "6721590cd...",
  "opportunityType": "internship",
  "coverLetter": "Statement of interest and qualifications...",
  "resumeUrl": "https://example.com/resume.pdf"
}
```
- **Integrity Enforcement:** Duplicate applications by the same student to the same opportunity are rejected with `HTTP 409 Conflict`.
- **Response (201 Created)**

### `GET /applications/me`
- **Auth:** Required (`student` only)
- **Description:** Returns all submitted applications with enriched opportunity information and current stage.

### `POST /applications/:id/withdraw`
- **Auth:** Required (`student` owner)
- **Description:** Sets application status to `withdrawn` if not already concluded.

### `GET /applications/employer`
- **Auth:** Required (`employer` or `admin`)
- **Query Parameters:** `opportunityId`, `status`.
- **Description:** Returns candidate applications for listings published by the authenticated recruiter.

### `PATCH /applications/:id/status`
- **Auth:** Required (Employer owning the listing or `admin`)
- **Body:**
```json
{
  "status": "shortlisted",
  "note": "Candidate advanced to technical interview"
}
```
- **Allowed Statuses:** `applied`, `in_review`, `shortlisted`, `accepted`, `rejected`.

---

## 6. Bookmarks & Student Profiles
- `GET /saved-opportunities`: List saved roles (Student).
- `POST /saved-opportunities/:opportunityId`: Save role (Student).
- `DELETE /saved-opportunities/:opportunityId`: Remove saved role (Student).
- `GET /students/me`: View student profile and resume.
- `PATCH /students/me`: Update student headline, bio, skills, education, and links.

---

## 7. Reports & Administration
- `POST /reports`: Submit abuse or scam report for listing (Authenticated).
- `GET /admin/stats`: Total counts of users, listings, applications, and pending reports (Admin only).
- `GET /admin/reports`: View pending community reports (Admin only).
- `PATCH /admin/reports/:id`: Resolve report and take action (`listing_removed`, `warning_issued`, `none`) (Admin only).
- `GET /admin/users`: View user directory (Admin only).
- `PATCH /admin/verify-company`: Update company verification status (Admin only).
