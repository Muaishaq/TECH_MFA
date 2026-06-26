# MFA Platform — Architecture Reference
**Quick-reference for database relationships, API flow, and system design decisions**

---

## ENTITY RELATIONSHIP SUMMARY

```
users ──────────────┬── enrollments ──── courses ──── modules ──── lessons
                    │                       │
                    ├── payments ───────────┘
                    │
                    ├── progress ──────── lessons
                    │
                    └── notifications

batches ────────────┬── enrollments
                    └── live_sessions ──── courses
```

---

## KEY RELATIONSHIPS

| From | To | Type | Notes |
|------|----|------|-------|
| users | enrollments | 1:many | One student, many enrollments |
| courses | enrollments | 1:many | One course, many students enrolled |
| courses | modules | 1:many | Ordered by index |
| modules | lessons | 1:many | Ordered by index |
| users | progress | 1:many | Per lesson |
| batches | enrollments | 1:many | Batch-specific enrollment |
| batches | live_sessions | 1:many | Sessions belong to batch |
| users | payments | 1:many | Payment history |
| courses | payments | 1:many | Payment for a course |

---

## SYSTEM ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────┐
│                   CLIENT (Vercel)                │
│              Lovable / React Frontend            │
│                                                 │
│  Landing → Auth → Courses → Dashboard → Admin  │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS / REST API
                   │
┌──────────────────▼──────────────────────────────┐
│              BACKEND (Railway)                   │
│            Node.js + Express                     │
│                                                 │
│  Routes → Controllers → Services → Prisma ORM  │
└──────┬───────────────────────┬───────────────────┘
       │                       │
┌──────▼──────┐      ┌─────────▼──────────┐
│  Supabase   │      │      Paystack      │
│  PostgreSQL │      │   Payment Gateway  │
│  + Storage  │      │   (Webhook →       │
└─────────────┘      │   backend)         │
                     └────────────────────┘
                              │
                     ┌────────▼───────────┐
                     │  Email Service     │
                     │  (Nodemailer/      │
                     │   Resend)          │
                     └────────────────────┘
```

---

## FRONTEND ROUTING MAP

```
/                          → Landing.jsx (public)
/forex                     → ForexAcademy.jsx (public)
/tech                      → TechAcademy.jsx (public)
/courses/:id               → CourseDetail.jsx (public)
/auth/register             → Register.jsx (guest only)
/auth/login                → Login.jsx (guest only)
/auth/verify-email         → VerifyEmail.jsx
/auth/forgot-password      → ForgotPassword.jsx
/auth/reset-password       → ResetPassword.jsx
/checkout/:courseId        → Checkout.jsx (student)
/payment/success           → PaymentSuccess.jsx (student)
/dashboard                 → StudentDashboard.jsx (student)
/dashboard/courses         → MyCourses.jsx (student)
/dashboard/courses/:id     → CoursePlayer.jsx (student)
/dashboard/sessions        → LiveClasses.jsx (student)
/dashboard/profile         → Profile.jsx (student)
/admin                     → AdminDashboard.jsx (admin)
/admin/courses             → ManageCourses.jsx (admin)
/admin/batches             → ManageBatches.jsx (admin)
/admin/students            → ManageStudents.jsx (admin)
/admin/sessions            → ManageSessions.jsx (admin)
/admin/transactions        → Transactions.jsx (admin)
```

---

## DECISION LOG

| Decision | Reason |
|----------|--------|
| Paystack over Flutterwave | Better Nigerian UX, simpler webhook, cleaner API |
| Jitsi (self-hosted) over Zoom API | Zero per-minute cost, fully brandable |
| Supabase over raw Postgres | Free managed DB + built-in storage |
| JWT (not sessions) | Stateless, scales well, works with Lovable frontend |
| Prisma over raw SQL | Type-safe, migration-friendly, Copilot plays well with it |
| VS Code + Copilot (not Cursor) | Cursor reserved for TechTrust project — clean separation |
| Railway over Vercel for backend | Persistent server process (Express), not serverless |
| express.raw() on webhook only | Paystack signature check requires raw body |
| JSONB for form_schema | Flexible form builder without schema changes |

---

*This document is a companion to specification.md and constitution.md*

---

## CHAT SYSTEM ARCHITECTURE

```
Student Browser (Socket.io client)
        │
        │ WebSocket (JWT on handshake)
        │
Node.js + Socket.io Server
        │
        ├── roomGuard.js (verify membership before any room action)
        │
        ├── chat.socket.js (event handlers)
        │
        └── PostgreSQL (messages, chat_rooms, chat_members, reactions)
                │
                └── Supabase Storage (chat-attachments bucket)
```

## CHAT ROOM HIERARCHY

```
MFA Platform
├── #mfa-announcements     (admin write, all read)
├── Forex Academy
│   ├── #forex-lounge      (all forex students)
│   ├── Forex Batch 1 🔒   (auto-assigned, archived)
│   ├── Forex Batch 2 🔒   (auto-assigned, archived)
│   └── Forex Batch 3      (active — current batch)
└── Tech Academy
    ├── #tech-lounge       (all tech students)
    ├── Tech Batch 1 🔒    (auto-assigned, archived)
    └── Tech Batch 2       (active — current batch)
```

## PWA INSTALL FLOW

```
User visits site on mobile
        ↓
Browser detects PWA manifest + service worker
        ↓
After login: show custom "Install MFA App" banner
        ↓
User taps Install → browser install prompt fires
        ↓
App installed on home screen (Android/Windows/Mac)

iOS: separate flow → show "Tap Share → Add to Home Screen" modal
```

## UPDATED DECISION LOG ADDITIONS

| Decision | Reason |
|----------|--------|
| Hybrid chat (no DMs) | Reduces moderation burden, protects founder legally |
| Socket.io over SSE/polling | Real-time bidirectional, works well with Node.js |
| PWA over React Native (Phase 1) | Zero cost, works on all devices, no App Store approval needed |
| Auto-assign to batch chat on enrollment | Removes manual step, ensures no student is left out of their group |
| Batch groups archived (not deleted) | Students retain access to learning conversations after batch ends |
