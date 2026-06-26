# MFA Platform — Project Constitution
**"The rules we never break."**  
**Version:** 1.0.0 | **Owner:** Muaishaq (CEO, TechTrust / MFA)

---

## 1. PRIME DIRECTIVE

> Every decision made in this project — code, design, database, or architecture — must serve one goal: **a professional, secure, and scalable academy platform that the founder can fully control without touching code after launch.**

---

## 2. PROJECT IDENTITY

| Property | Value |
|----------|-------|
| Project Name | MFA Platform |
| GitHub Repo | `Muaishaq/MFA` |
| Academies | Forex Academy · Tech Academy |
| Primary Color | Deep Navy `#0A0F2C` |
| Accent (Forex) | Gold `#C9A84C` |
| Accent (Tech) | Electric Blue `#00CFFF` |
| Neutral | Warm White `#F5F5F0` |
| Danger | `#E74C3C` |
| Success | `#2ECC71` |
| Font (Headings) | `Clash Display` or `Space Grotesk` |
| Font (Body) | `Inter` |
| Border Radius | `12px` (cards), `8px` (inputs), `50px` (pills) |
| Shadow Standard | `0 4px 24px rgba(0,0,0,0.12)` |

---

## 3. FILE & FOLDER STRUCTURE

### 3.1 Repository Root
```
MFA/
├── client/          ← Lovable frontend (exported or managed separately)
├── server/          ← Node.js/Express backend (VS Code + Copilot)
├── docs/            ← specification.md, constitution.md, todo.md, erd.md
├── .env.example     ← env template (never commit real .env)
├── .gitignore
└── README.md
```

### 3.2 Backend Structure (`server/`)
```
server/
├── src/
│   ├── config/
│   │   ├── db.js            ← Prisma client instance
│   │   ├── paystack.js      ← Paystack config
│   │   └── jitsi.js         ← Jitsi room name generator (Phase 1: public embed only)
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── course.controller.js
│   │   ├── batch.controller.js
│   │   ├── payment.controller.js
│   │   ├── session.controller.js
│   │   └── admin.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js      ← JWT verification
│   │   ├── role.middleware.js      ← admin/student guard
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── course.routes.js
│   │   ├── batch.routes.js
│   │   ├── payment.routes.js
│   │   ├── session.routes.js
│   │   └── admin.routes.js
│   ├── services/
│   │   ├── email.service.js        ← Nodemailer/Resend
│   │   ├── paystack.service.js
│   │   └── notification.service.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── validateSchema.js       ← Zod validators
│   │   └── asyncHandler.js
│   └── app.js                      ← Express app setup
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env
├── .env.example
├── package.json
└── server.js                       ← Entry point
```

### 3.3 Frontend Structure (Lovable — client/)
```
client/
├── src/
│   ├── components/
│   │   ├── ui/              ← shadcn/ui base components
│   │   ├── layout/          ← Navbar, Footer, Sidebar
│   │   ├── academy/         ← ForexHero, TechHero, CourseCard
│   │   ├── dashboard/       ← StudentDashboard, AdminDashboard
│   │   ├── forms/           ← DynamicForm, AuthForm, PaymentForm
│   │   └── shared/          ← Button, Modal, Badge, Spinner
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── ForexAcademy.jsx
│   │   ├── TechAcademy.jsx
│   │   ├── CourseDetail.jsx
│   │   ├── Checkout.jsx
│   │   ├── Dashboard/
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── MyCourses.jsx
│   │   │   ├── LiveClasses.jsx
│   │   │   └── Profile.jsx
│   │   └── Admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── ManageCourses.jsx
│   │       ├── ManageBatches.jsx
│   │       ├── ManageStudents.jsx
│   │       ├── ManageSessions.jsx
│   │       └── FormBuilder.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useCourses.js
│   │   └── usePayment.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── services/
│   │   └── api.js           ← Axios instance with base URL + interceptors
│   ├── utils/
│   │   └── formatCurrency.js
│   └── styles/
│       └── globals.css      ← CSS variables, Tailwind base
```

---

## 4. CODING STANDARDS

### 4.1 General Rules (Both Frontend & Backend)
- **No magic numbers.** All constants go in a `constants.js` or `.env`
- **No hardcoded strings.** Enum values are defined once and reused
- **Every async function is wrapped** in `asyncHandler` (backend) or `try/catch` (frontend)
- **No `console.log` in production code.** Use a logger (winston or pino)
- **Every route is documented** with a one-line comment above it
- **Input validation on every POST/PUT endpoint** using Zod
- **Never store raw passwords.** Always bcrypt with salt rounds ≥ 12

### 4.2 Backend (Node.js/Express)
- Controllers only handle request/response — **business logic goes in services**
- Routes import controllers — controllers import services — services import config
- **Every DB call uses Prisma** — no raw SQL unless absolutely necessary
- Middleware is applied at router level, not in individual controllers
- The webhook endpoint `/api/payments/webhook` **must verify Paystack signature before doing anything**
- Error responses always follow this shape:
```json
{
  "success": false,
  "message": "Human-readable error",
  "error": "INTERNAL_CODE" 
}
```
- Success responses always follow this shape:
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {}
}
```

### 4.3 Frontend (Lovable/React)
- **One component per file.** No exceptions.
- **Props are typed** with PropTypes or JSDoc comments
- **No inline styles.** All styling via Tailwind classes or CSS variables
- **Auth state lives only in AuthContext.** Never duplicated in local component state
- **API calls live only in `/services/api.js` or custom hooks.** Never in JSX directly
- All forms use controlled inputs — never uncontrolled
- **Admin routes are wrapped** in `<AdminGuard>` component that checks role before rendering

### 4.4 Git Commit Standard
```
Format: <type>(<scope>): <short description>

Types: feat | fix | chore | docs | style | refactor | test

Examples:
feat(auth): add JWT refresh token rotation
fix(payment): handle webhook duplicate events
chore(db): add migrations for batch table
docs: update specification with live session schema
```

---

## 5. ENVIRONMENT VARIABLES

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Paystack
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="MFA Platform <noreply@mfaacademy.com>"

# Jitsi (Phase 1 — public embed, no keys needed)
# JITSI_DOMAIN defaults to meet.jit.si — no config required until Phase 2
# Phase 2 (self-hosted): uncomment below when funded
# JITSI_APP_ID=your_jitsi_app_id
# JITSI_APP_SECRET=your_jitsi_secret
# JITSI_DOMAIN=meet.mfaacademy.com

# Supabase Storage
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Frontend
VITE_API_URL=http://localhost:5000/api
VITE_PAYSTACK_PUBLIC_KEY=pk_live_...
```

> **RULE:** `.env` is NEVER committed to GitHub. `.env.example` is always up to date.

---

## 6. SECURITY CONSTITUTION

| Rule | Implementation |
|------|---------------|
| All routes authenticated by default | Public routes explicitly marked |
| Passwords hashed | bcrypt, 12 salt rounds |
| JWT short-lived | Access: 15min, Refresh: 7 days |
| Webhook verified | Paystack HMAC-SHA512 signature check |
| Rate limiting | `express-rate-limit` on auth + payment routes |
| SQL injection | Prisma parameterized queries (no raw SQL) |
| XSS protection | `helmet.js`, input sanitization |
| CORS locked | Only frontend domain in production |
| Admin routes double-protected | JWT middleware + role middleware |
| Sensitive data never in logs | Mask email/ref in logger |

---

## 7. AUTOMATED PAYMENT WEBHOOK LIFECYCLE (LAW)

This is the exact sequence the backend **must** follow — no deviations:

```
Step 1: Receive POST /api/payments/webhook
Step 2: Read raw request body (must use express.raw() for this route ONLY)
Step 3: Compute HMAC-SHA512 of raw body using PAYSTACK_WEBHOOK_SECRET
Step 4: Compare computed hash to x-paystack-signature header
        → If mismatch: return 401 immediately, log the attempt
        → If match: continue
Step 5: Parse event type → only handle 'charge.success'
Step 6: Extract reference from event data
Step 7: Check if payment with this reference already exists and is 'success'
        → If yes (duplicate): return 200 immediately (Paystack requires 200)
        → If no: continue
Step 8: Update payment record status to 'success', set paid_at = NOW()
Step 9: Create enrollment record with status = 'active'
Step 10: Send confirmation email to student (async, non-blocking)
Step 11: Create in-app notification for student
Step 12: Return 200 OK to Paystack
```

> **CRITICAL RULES:**
> - Always return HTTP 200 to Paystack even on business logic errors (log it, don't throw)
> - Never process a webhook event twice (idempotency check on Step 7)
> - The webhook route must use `express.raw({ type: 'application/json' })` — NOT `express.json()`

---

## 8. DYNAMIC FORM BUILDER RULES (ADMIN)

The batch enrollment form builder allows admin to create custom registration forms. These rules keep it secure:

- Form schema is stored as a **JSON array** in the `batches.form_schema` column
- Each field object shape:
```json
{
  "id": "uuid",
  "label": "Full Name",
  "type": "text | select | number | checkbox | file | textarea",
  "placeholder": "Enter your full name",
  "required": true,
  "options": ["Option 1", "Option 2"],  // for select type only
  "order": 1
}
```
- Student responses stored in `enrollments.form_data` as JSON
- **Security rule:** The form builder ONLY controls presentation/schema. It cannot modify DB structure, access other tables, or inject queries. The backend validates all submitted `form_data` strictly against the stored schema before saving.
- File upload fields in forms are sent to Supabase Storage — never stored as base64 in DB

---

## 9. LIVE SESSION CONSTITUTION (JITSI)

### Phase 1 — Free Public Embed (meet.jit.si)
- **No cost. No server. No setup.** Uses Jitsi's public infrastructure.
- **Jitsi room names** are auto-generated as: `mfa-{academy}-{uuid-short}` — never user-defined (prevents random people guessing room names)
- Room URL format: `https://meet.jit.si/mfa-forex-a3f9c2` (auto-generated, stored in DB)
- Admin creates a session → system generates unique room name → stores it
- Enrolled students see the session in dashboard — "Join Class" button opens the Jitsi room
- **Embed method:** Open in new tab (Phase 1) OR iframe embed with Jitsi IFrame API (cleaner UX)
- Join button is visible only to enrolled students, unlocked 15 minutes before session start
- Early access (>15min before) shows a countdown timer instead of the join button
- After class: admin pastes recording link (OBS/screen capture) into session record → appears in course library
- **No JWT tokens needed in Phase 1** — room name obscurity is the access control

### Phase 2 — Self-Hosted (when funded, ~$5/month)
- Migrate to VPS-hosted Jitsi with custom domain `meet.mfaacademy.com`
- Enable JWT authentication: admin gets moderator token, students get participant token
- Tokens expire at `scheduled_at + duration_mins`
- Full branding: your logo, colors, domain — indistinguishable from a proprietary product
- **Upgrade is seamless** — only the domain and token logic changes in the backend

---

## 10. PHASES & WHAT NOT TO BUILD YET

### Build in Phase 1 (NOW):
- Auth system
- Landing page (split-screen)
- Course catalog (forex + tech)
- Student dashboard
- Admin dashboard
- Payment system (Paystack)
- Batch enrollment with dynamic forms
- Content library (videos, PDFs)
- Community chat system (Socket.io — hybrid: lounges + batch groups, no DMs)
- PWA setup (manifest, service worker, installable on all devices)

### Build in Phase 2 (LATER — when funded):
- Self-hosted Jitsi ($5/month VPS) replacing public embed
- In-app notifications (push via PWA service worker)
- Progress tracking
- Google OAuth
- React Native app (App Store + Play Store listing)
- Certificate generation

### Build in Phase 3 (GROWTH):
- DMs between students (when you have moderators)
- Multi-currency support (USD, GBP)
- Affiliate/referral system

### NEVER build unless specified:
- Custom video hosting (use YouTube embed or Supabase URL)
- Anything not in `specification.md`

---

*End of constitution.md — These rules are law until the founder changes them.*

---

## 10. COMMUNITY CHAT CONSTITUTION

**These rules are permanent and cannot be overridden by any user, including admin:**

| Rule | Detail |
|------|--------|
| No DMs | Direct messages between students are permanently disabled — no exceptions |
| No user-created rooms | Students cannot create channels. Only admin and the system can |
| Batch groups are system-assigned | Auto-assigned on enrollment activation, never manually joinable |
| Message deletion window | Students can delete own messages within 5 minutes only |
| Admin moderation | Admin can delete any message, pin any message, in any room |
| Archived rooms are read-only | Completed batch groups become archives — no new messages |
| Attachment limits | Max file size: 10MB per upload. Allowed: images, PDF, docx |
| No external links in announcements | Keep announcements clean — no phishing risk |

**Socket.io Security Rules:**
- Every socket connection must present a valid JWT token on handshake
- Server verifies token before allowing `join_room`
- Server checks room membership before broadcasting messages — client cannot spoof room access
- Rate limit: max 10 messages per minute per user
- Admin socket gets elevated privileges server-side only — never trust client role claims

**Chat Folder Structure (server):**
```
src/
├── controllers/
│   └── chat.controller.js
├── routes/
│   └── chat.routes.js
├── services/
│   └── chat.service.js       ← room membership, message CRUD
├── sockets/
│   ├── index.js              ← Socket.io server init + auth middleware
│   ├── chat.socket.js        ← event handlers (join, message, reaction, typing)
│   └── roomGuard.js          ← verify user is member before any room action
```

**Chat Folder Structure (client):**
```
src/
├── components/
│   └── chat/
│       ├── ChatSidebar.jsx       ← room list with unread badges
│       ├── ChatWindow.jsx        ← message feed
│       ├── MessageBubble.jsx     ← single message + reactions
│       ├── MessageInput.jsx      ← text input + attachment + emoji picker
│       ├── TypingIndicator.jsx
│       └── PinnedMessage.jsx
├── hooks/
│   └── useSocket.js              ← Socket.io connection + event subscription
├── context/
│   └── ChatContext.jsx           ← active room, unread counts, socket instance
```

---

## 11. PWA CONSTITUTION

- PWA is not optional — it IS the mobile and desktop app strategy for Phase 1 and 2
- `manifest.json` must be present and valid before first deployment
- Service worker must be registered on app load — use Vite PWA plugin (`vite-plugin-pwa`)
- Push notifications require user permission prompt — ask after first login, not on landing page
- App icon must use MFA branding (navy background, gold/blue logo) — 192px and 512px required
- Offline fallback page must exist — never show a blank screen when offline
- PWA install prompt: show a custom "Install App" banner in the dashboard header (not the browser default)
