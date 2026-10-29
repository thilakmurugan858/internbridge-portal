# InternBridge Security Architecture & Threat Model

## 1. Threat Model & Risk Analysis

| Threat / Vulnerability | Attack Vector | Potential Impact | InternBridge Mitigation |
| :--- | :--- | :--- | :--- |
| **Credential Stuffing / Brute Force** | High-frequency password attempts on `/api/auth/login` | Account takeover | `express-rate-limit` restricting auth endpoints to 30 requests per 15-minute window per IP |
| **Password Compromise** | Database exfiltration | Cleartext exposure | `bcryptjs` one-way salted hashing with 12 computational rounds; passwords excluded by default (`select: false`) |
| **Cross-Site Scripting (XSS) Session Hijacking** | Malicious script stealing tokens from localStorage | Unauthorized session hijacking | `HttpOnly`, `SameSite=Lax` cookies; Next.js automatic HTML escaping; Helmet security headers |
| **Privilege Escalation** | Student calling employer or admin endpoints | Unauthorized listing modification or moderation bypass | Server-side `authorize('employer', 'admin')` middleware; strict ownership verification on updates |
| **NoSQL / Query Injection** | Tainted JSON objects in search and filter inputs | Arbitrary data exposure | Strict schema validation with Zod (`validateRequest`); explicit casting and parameterized regex parsing |
| **Duplicate Application DoS** | Candidate repeatedly submitting applications | Application table flooding | Unique compound database constraint on `{ opportunityId: 1, studentId: 1 }` |
| **Information Leakage via Errors** | Uncaught exceptions returning stack traces | Internal topology disclosure | Centralized `errorHandler` middleware returning sanitized JSON envelopes |

---

## 2. Implemented Defense-in-Depth Controls

### 2.1 Password Security
- Passwords are never stored in plaintext or reversible encryption.
- Hashing is performed via `AuthService.hashPassword()` using `bcryptjs` with salt round factor 12.
- The `passwordHash` field has `select: false` in the Mongoose User schema, ensuring queries never leak password hashes into API responses.

### 2.2 Token Lifecycle & Session Handling
- Authentication utilizes HMAC-SHA256 JSON Web Tokens (JWT).
- Tokens are delivered via `HttpOnly` cookies, preventing client-side JavaScript access.
- In production environments (`NODE_ENV === 'production'`), the `secure: true` flag is enforced so cookies are strictly transmitted over TLS/HTTPS.
- Configurable expiration (default: 7 days).

### 2.3 Strict Authorization & Ownership Checks
Hiding buttons on the frontend is never treated as authorization. The Express API strictly validates ownership:
```typescript
if (internship.employerId.toString() !== req.user?.userId && req.user?.role !== 'admin') {
  sendError(res, 'Forbidden: You do not own this listing', 403);
  return;
}
```

### 2.4 Rate Limiting & DoS Safeguards
- `authLimiter`: 30 attempts per 15 minutes for `/api/auth/login` and `/api/auth/register`.
- `apiLimiter`: 300 requests per 15 minutes across all general API endpoints.
- Payload body size limit capped at 5MB to prevent memory exhaustion attacks.

### 2.5 Security Headers
Integrated via `helmet`:
- `X-DNS-Prefetch-Control`
- `X-Frame-Options: SAMEORIGIN` (Clickjacking defense)
- `X-Download-Options: noopen`
- `X-Content-Type-Options: nosniff` (MIME sniffing prevention)
- `Cross-Origin-Resource-Policy: cross-origin`

---

## 3. Production Deployment Hardening Checklist

When transitioning from local development to cloud production:
1. **Environment Secrets:** Supply a high-entropy string for `JWT_SECRET` (at least 64 random alphanumeric characters) stored in a secret manager (e.g., AWS Secrets Manager or GCP Secret Manager).
2. **TLS / HTTPS:** Terminate SSL/TLS via reverse proxy (Nginx, Cloudflare, or AWS ALB) with automated Let's Encrypt certificates.
3. **Database Network Isolation:** Restrict MongoDB Atlas or local MongoDB instances to the backend virtual private cloud (VPC) subnet.
4. **Cloud Object Storage for Resumes:** Connect AWS S3 or Google Cloud Storage with private pre-signed URLs rather than accepting external public URL strings.
