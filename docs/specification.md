# MFA Platform — System Specification
**Project:** Muaishaq's Dual Academy Platform  
**Repo:** https://github.com/Muaishaq/MFA.git  
**Version:** 1.0.0  
**Last Updated:** 2026-06-26  
**Architect:** Senior Technical Architect (AI-assisted)

---

## 1. PROJECT OVERVIEW

The MFA Platform is a dual-academy web application hosting two distinct learning tracks:

- **MFA Forex Academy** — Trading education, SMC/CRT methodology, live sessions, and mentorship
- **MFA Tech Academy** — Coding education, beginner roadmaps, Full - Stack engineering mentorship, Vibe coding.

The platform replaces a manual, informal system with a fully structured, automated, and professional learning management system (LMS) with live class capability, batch-controlled enrollment, content delivery, and payment automation.

---

## 2. ACADEMY COURSE DEFINITIONS

### 2.1 Forex Academy — Course Structure

| Course | Type | Description |
|--------|------|-------------|
| Forex Foundations | Free (Promo) | Introduction to Forex, how the market works, basic terminology |
| Smart Money Concepts (SMC) | Paid | Order blocks, BOS, CHOCH, liquidity grabs |
| CRT Concepts | Paid | Inner circle trader methodology |
| Risk & Psychology Mastery | Paid | Position sizing, trading mindset, journaling |
| Live Trading Sessions | Paid (Mentorship) | Real-time trade analysis via live class |
| 1-on-1 Mentorship Batch | Paid (Batch) | Closed cohort, admin-controlled enrollment |

### 2.2 Tech Academy — Course Structure

| Course | Type | Description |
|--------|------|-------------|
| Tech Roadmap for Beginners | Free (Promo) | How to start coding, what to learn, career paths |
| Frontend Development Track | Paid | HTML, CSS, JS, React — beginner to mid-level |
| Backend Development Track | Paid | Node.js, Express, databases, APIs |
| AI/ML Fundamentals | Paid | Python basics, scikit-learn, intro to ML |
| Full-Stack Project Bootcamp | Paid | Build and deploy a real project |
| Tech Mentorship Batch | Paid (Batch) | Closed cohort, admin-controlled enrollment |

### 2.3 Promo Free Course Strategy

- At any given time, **one course per academy** can be marked as "Promo Free" by the admin
- Promo courses are fully accessible without payment but require account registration (lead capture)
- Admin can toggle any course between Paid / Promo Free from the dashboard
- Promo free courses expire on admin-set date and revert to Paid automatically

---

## 3. USER ROLES

### 3.1 Role Definitions

| Role | Description |
|------|-------------|
| `guest` | Unauthenticated visitor — can view landing page, course catalog |
| `student` | Registered user — can access free/paid courses based on enrollment |
| `admin` | Platform owner (you) — full control over all platform functions |

### 3.2 Admin Capabilities

- Open / close batch registration (per academy, per cohort)
- Create, edit, delete courses (title, description, modules, pricing, type)
- Design and modify enrollment/registration form fields (dynamic form builder — no code required)
- Upload course materials (videos, PDFs, links)
- Schedule and launch live classes (Jitsi-powered)
- Manage students (view, suspend, enroll manually, export)
- Manage payments (view transactions, issue refunds, mark manual payments)
- Toggle promo free status on any course
- Send announcements / notifications to students

### 3.3 Student Capabilities

- Register and create a profile
- Browse course catalog
- Enroll in free/promo courses immediately
- Pay for and access paid courses
- Join live classes from dashboard
- Access recorded class videos and uploaded PDFs
- View their enrollment history and progress

---

## 4. FUNCTIONAL REQUIREMENTS

### 4.1 Authentication System
- Email + password registration (fresh build — no existing auth)
- Email verification on signup
- JWT-based session management (Access Token + Refresh Token)
- Forgot password / reset flow
- Role-based route protection (middleware-level)
- OAuth optional in Phase 2 (Google Sign-In)

### 4.2 Landing Page
- Split-screen hero: Left = Forex Academy, Right = Tech Academy
- Each side has sector-specific imagery, CTA button, and description
- Shared navigation header
- Unified color palette (defined in `constitution.md`)
- Sections: Hero → About → Featured Courses → Testimonials → CTA → Footer

### 4.3 Course Management (Admin)
- Full CRUD for courses
- Each course has: title, description, academy (forex/tech), type (free/promo/paid), price, thumbnail, modules[]
- Dynamic enrollment form builder: admin adds/removes/reorders form fields (text, select, number, checkbox, file) — stored in DB as JSON schema, rendered dynamically on frontend
- Promo free toggle with optional expiry date

### 4.4 Batch Enrollment System
- Each mentorship program is a "Batch"
- Batch has: name, academy, max_students, open_date, close_date, status (open/closed)
- Admin manually sets status to `open` or `closed` from dashboard
- When open: registration form is live and visible
- When closed: form is hidden, waitlist option shown
- Student submits dynamic form → pending review → admin approves/rejects → student gets email notification

### 4.5 Payment System (Paystack)
- Paid courses trigger Paystack checkout on enrollment
- Webhook receives payment confirmation from Paystack
- On successful webhook: enrollment record created, course access granted, confirmation email sent
- Payment records stored with: student_id, course_id, amount, reference, status, timestamp
- Admin can view all transactions in dashboard

### 4.6 Live Class System (Jitsi — Self-Hosted)
- Admin creates a "Live Session" linked to a course/batch
- Session has: title, date, time, duration, Jitsi room name (auto-generated), course_id
- Enrolled students see upcoming sessions in their dashboard
- "Join Class" button generates a Jitsi URL (branded, embedded in iframe or new tab)
- Admin has moderator token; students join as participants
- After class: admin uploads recording link (from screen capture / OBS) to the session record
- Recorded sessions appear in course material library

### 4.7 Content Library
- Per-course content area: modules, lessons
- Lesson types: video (YouTube embed or uploaded URL), PDF (uploaded to cloud storage), text/rich-text
- Students access content only for enrolled courses
- Progress tracking: lesson marked complete on view

### 4.8 Notifications
- Email notifications: welcome, enrollment approved, payment confirmed, class reminder (24h before)
- In-app notification bell with unread count

---

## 5. NON-FUNCTIONAL REQUIREMENTS

| Requirement | Target |
|------------|--------|
| Performance | Page load < 3s on 4G |
| Security | HTTPS, input sanitization, rate limiting, helmet.js |
| Scalability | Stateless backend, DB connection pooling |
| Availability | 99.5% uptime target |
| Mobile Responsiveness | Full mobile-first design |
| Browser Support | Chrome, Firefox, Safari, Edge (last 2 versions) |
| Accessibility | WCAG 2.1 AA minimum |

---

## 6. TECH STACK

| Layer | Technology |
|-------|-----------|
| Frontend | Lovable (React-based rapid UI) |
| Backend | Node.js + Express.js |
| Framework option | Next.js (for SSR/API routes if needed) |
| Database | PostgreSQL (via Supabase — free tier, managed) |
| ORM | Prisma |
| Auth | JWT (jsonwebtoken + bcrypt) |
| Payment | Paystack |
| Video/Live | Jitsi Meet (self-hosted on Railway/Render) |
| File Storage | Supabase Storage (PDFs, thumbnails) |
| Email | Nodemailer + Gmail SMTP or Resend (free tier) |
| IDE (Backend) | VS Code + GitHub Copilot |
| Frontend Builder | Lovable |
| Version Control | GitHub (`Muaishaq/MFA`) |
| Deployment | Vercel (frontend) + Railway or Render (backend) |

---

## 7. DATABASE SCHEMA

### users
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
full_name       VARCHAR(100) NOT NULL
email           VARCHAR(150) UNIQUE NOT NULL
password_hash   TEXT NOT NULL
role            ENUM('student', 'admin') DEFAULT 'student'
is_verified     BOOLEAN DEFAULT FALSE
avatar_url      TEXT
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

### courses
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
title           VARCHAR(200) NOT NULL
description     TEXT
academy         ENUM('forex', 'tech') NOT NULL
type            ENUM('free', 'promo', 'paid') NOT NULL
price           DECIMAL(10,2) DEFAULT 0
thumbnail_url   TEXT
is_published    BOOLEAN DEFAULT FALSE
promo_expires   TIMESTAMP
created_at      TIMESTAMP DEFAULT NOW()
updated_at      TIMESTAMP DEFAULT NOW()
```

### modules
```sql
id              UUID PRIMARY KEY
course_id       UUID REFERENCES courses(id) ON DELETE CASCADE
title           VARCHAR(200) NOT NULL
order_index     INTEGER NOT NULL
created_at      TIMESTAMP DEFAULT NOW()
```

### lessons
```sql
id              UUID PRIMARY KEY
module_id       UUID REFERENCES modules(id) ON DELETE CASCADE
title           VARCHAR(200) NOT NULL
type            ENUM('video', 'pdf', 'text') NOT NULL
content_url     TEXT
rich_text       TEXT
order_index     INTEGER NOT NULL
created_at      TIMESTAMP DEFAULT NOW()
```

### batches
```sql
id              UUID PRIMARY KEY
name            VARCHAR(200) NOT NULL
academy         ENUM('forex', 'tech') NOT NULL
course_id       UUID REFERENCES courses(id)
max_students    INTEGER
status          ENUM('open', 'closed', 'completed') DEFAULT 'closed'
form_schema     JSONB  -- dynamic form field definitions
open_date       TIMESTAMP
close_date      TIMESTAMP
created_at      TIMESTAMP DEFAULT NOW()
```

### enrollments
```sql
id              UUID PRIMARY KEY
student_id      UUID REFERENCES users(id)
course_id       UUID REFERENCES courses(id)
batch_id        UUID REFERENCES batches(id)
status          ENUM('pending', 'approved', 'rejected', 'active') DEFAULT 'pending'
form_data       JSONB  -- student's answers to dynamic form
enrolled_at     TIMESTAMP DEFAULT NOW()
```

### payments
```sql
id              UUID PRIMARY KEY
student_id      UUID REFERENCES users(id)
course_id       UUID REFERENCES courses(id)
amount          DECIMAL(10,2) NOT NULL
currency        VARCHAR(10) DEFAULT 'NGN'
paystack_ref    VARCHAR(100) UNIQUE
status          ENUM('pending', 'success', 'failed') DEFAULT 'pending'
paid_at         TIMESTAMP
created_at      TIMESTAMP DEFAULT NOW()
```

### live_sessions
```sql
id              UUID PRIMARY KEY
course_id       UUID REFERENCES courses(id)
batch_id        UUID REFERENCES batches(id)
title           VARCHAR(200) NOT NULL
scheduled_at    TIMESTAMP NOT NULL
duration_mins   INTEGER DEFAULT 60
jitsi_room      VARCHAR(200) NOT NULL
recording_url   TEXT
created_by      UUID REFERENCES users(id)
created_at      TIMESTAMP DEFAULT NOW()
```

### notifications
```sql
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
title           VARCHAR(200) NOT NULL
message         TEXT NOT NULL
is_read         BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP DEFAULT NOW()
```

### progress
```sql
id              UUID PRIMARY KEY
student_id      UUID REFERENCES users(id)
lesson_id       UUID REFERENCES lessons(id)
completed       BOOLEAN DEFAULT FALSE
completed_at    TIMESTAMP
UNIQUE(student_id, lesson_id)
```

---

## 8. API ROUTES

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/verify-email
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
```

### Courses
```
GET    /api/courses                    (public — catalog)
GET    /api/courses/:id                (public — course detail)
POST   /api/courses                    (admin only)
PUT    /api/courses/:id                (admin only)
DELETE /api/courses/:id                (admin only)
PATCH  /api/courses/:id/promo-toggle   (admin only)
```

### Modules & Lessons
```
GET    /api/courses/:id/modules
POST   /api/courses/:id/modules        (admin)
PUT    /api/modules/:id                (admin)
DELETE /api/modules/:id                (admin)
POST   /api/modules/:id/lessons        (admin)
PUT    /api/lessons/:id                (admin)
DELETE /api/lessons/:id                (admin)
PATCH  /api/lessons/:id/complete       (student — mark complete)
```

### Batches
```
GET    /api/batches                    (public — open batches)
GET    /api/batches/:id
POST   /api/batches                    (admin)
PUT    /api/batches/:id                (admin)
PATCH  /api/batches/:id/status         (admin — open/close)
POST   /api/batches/:id/enroll         (student — submit registration form)
GET    /api/batches/:id/enrollments    (admin)
PATCH  /api/enrollments/:id/approve    (admin)
PATCH  /api/enrollments/:id/reject     (admin)
```

### Payments
```
POST   /api/payments/initiate          (student — triggers Paystack)
POST   /api/payments/webhook           (Paystack webhook — public, verified by signature)
GET    /api/payments/verify/:reference (student — verify after redirect)
GET    /api/payments                   (admin — all transactions)
```

### Live Sessions
```
GET    /api/sessions                   (student — upcoming for enrolled courses)
GET    /api/sessions/:id
POST   /api/sessions                   (admin)
PUT    /api/sessions/:id               (admin)
DELETE /api/sessions/:id               (admin)
PATCH  /api/sessions/:id/recording     (admin — add recording URL)
```

### Admin
```
GET    /api/admin/students
GET    /api/admin/students/:id
PATCH  /api/admin/students/:id/suspend
GET    /api/admin/dashboard-stats
POST   /api/admin/announcements
```

---

## 9. PAYMENT WEBHOOK LIFECYCLE

```
Student clicks "Enroll" on paid course
        ↓
Frontend calls POST /api/payments/initiate
        ↓
Backend creates pending payment record → returns Paystack checkout URL
        ↓
Student completes payment on Paystack
        ↓
Paystack sends POST to /api/payments/webhook
        ↓
Backend verifies Paystack signature (x-paystack-signature header)
        ↓
Backend updates payment status → 'success'
        ↓
Backend creates enrollment record → status: 'active'
        ↓
Backend sends confirmation email to student
        ↓
Backend creates in-app notification for student
        ↓
Student dashboard now shows enrolled course
```

---

*End of specification.md*

---

## 10. COMMUNITY CHAT SYSTEM

### Chat Architecture (Hybrid Model — Option C)

**Channels:**

| Channel | Access | Description |
|---------|--------|-------------|
| `#mfa-announcements` | Read: all students · Write: admin only | Platform-wide broadcasts |
| `#forex-lounge` | All forex students | Open community, cross-batch mingling |
| `#tech-lounge` | All tech students | Open community, cross-batch mingling |
| `Batch Group: [Name]` | Batch members only (auto-assigned) | Private cohort chat |

**No DMs — by design. Permanent.**

### Auto-Assignment to Batch Group
```
Enrollment status changes to 'active'
        ↓
System checks: does enrollment have a batch_id?
        ↓ YES
System queries: batch's chat_room_id
        ↓
System creates chat_member record (user_id + room_id)
        ↓
Student sees batch group chat in their sidebar immediately
        ↓
Batch closes/completes → room status set to 'archived' (read-only)
```

### Chat Database Schema

#### chat_rooms
```sql
id              UUID PRIMARY KEY
name            VARCHAR(200) NOT NULL
type            ENUM('announcement', 'lounge', 'batch') NOT NULL
academy         ENUM('forex', 'tech', 'both') NOT NULL
batch_id        UUID REFERENCES batches(id)   -- NULL for lounge/announcement
status          ENUM('active', 'archived') DEFAULT 'active'
created_at      TIMESTAMP DEFAULT NOW()
```

#### chat_members
```sql
id              UUID PRIMARY KEY
room_id         UUID REFERENCES chat_rooms(id) ON DELETE CASCADE
user_id         UUID REFERENCES users(id) ON DELETE CASCADE
joined_at       TIMESTAMP DEFAULT NOW()
UNIQUE(room_id, user_id)
```

#### messages
```sql
id              UUID PRIMARY KEY
room_id         UUID REFERENCES chat_rooms(id) ON DELETE CASCADE
sender_id       UUID REFERENCES users(id)
content         TEXT
type            ENUM('text', 'image', 'file') DEFAULT 'text'
attachment_url  TEXT
is_pinned       BOOLEAN DEFAULT FALSE
is_deleted      BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP DEFAULT NOW()
edited_at       TIMESTAMP
```

#### message_reactions
```sql
id              UUID PRIMARY KEY
message_id      UUID REFERENCES messages(id) ON DELETE CASCADE
user_id         UUID REFERENCES users(id)
emoji           VARCHAR(10) NOT NULL
created_at      TIMESTAMP DEFAULT NOW()
UNIQUE(message_id, user_id, emoji)
```

### Chat API Routes
```
GET    /api/chat/rooms                     (student — their accessible rooms)
GET    /api/chat/rooms/:id/messages        (paginated, 50 per page)
POST   /api/chat/rooms/:id/messages        (send message — via REST, real-time via Socket.io)
DELETE /api/chat/messages/:id              (student: own msg within 5min | admin: any)
PATCH  /api/chat/messages/:id/pin          (admin only)
POST   /api/chat/messages/:id/reactions    (any member)
DELETE /api/chat/messages/:id/reactions    (remove own reaction)
GET    /api/admin/chat/rooms               (admin — all rooms)
POST   /api/admin/chat/rooms               (admin — create lounge/announcement rooms)
```

### Socket.io Events
```
Client emits:
  join_room        { room_id }
  leave_room       { room_id }
  send_message     { room_id, content, type }
  typing           { room_id }
  stop_typing      { room_id }
  add_reaction     { message_id, emoji }

Server emits:
  new_message      { message object }
  message_deleted  { message_id }
  message_pinned   { message object }
  user_typing      { user_id, name }
  user_joined      { user_id, name }
  reaction_updated { message_id, reactions[] }
```

---

## 11. PWA (PROGRESSIVE WEB APP)

### PWA Manifest Fields
```json
{
  "name": "MFA Academy",
  "short_name": "MFA",
  "description": "Forex & Tech Academy Platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0A0F2C",
  "theme_color": "#0A0F2C",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker Caching Strategy
- **Cache First:** Static assets (CSS, JS, fonts, icons)
- **Network First:** API responses (course data, messages)
- **Stale While Revalidate:** Course thumbnails, profile images
- **Push Notifications:** New chat messages, class reminders, announcements

### Device Support
| Device | Install Method |
|--------|---------------|
| Android (Chrome) | "Add to Home Screen" prompt (automatic) |
| iOS (Safari) | Share → "Add to Home Screen" |
| Windows (Chrome/Edge) | Install icon in address bar |
| Mac (Chrome/Edge) | Install icon in address bar |
