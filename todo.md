# MFA Platform — Implementation Roadmap
**Format:** Check off each item as you complete it. Never skip a step.  
**Work Style:** Frontend tasks → Lovable | Backend tasks → VS Code + Copilot  
**Repo:** `Muaishaq/MFA`

---

## PHASE 0 — ENVIRONMENT SETUP
*Do this before anything else. Takes ~1 hour.*

### Repository & Project Init
- [ ] Create folder structure: `MFA/client`, `MFA/server`, `MFA/docs`
- [ ] Move documentation files into `MFA/docs/`
- [ ] Push initial commit: `chore: init project structure`
- [ ] Add `.gitignore` (node_modules, .env, dist, .next)
- [ ] Create `.env.example` from constitution.md Section 5

### Backend Init (VS Code)
- [ ] `cd server && npm init -y`
- [ ] Install core deps: `npm i express prisma @prisma/client bcryptjs jsonwebtoken zod helmet cors express-rate-limit nodemailer uuid dotenv`
- [ ] Install dev deps: `npm i -D nodemon`
- [ ] Create `server.js` entry point
- [ ] Create `src/app.js` Express setup with helmet, cors, json middleware
- [ ] Add `"dev": "nodemon server.js"` to package.json scripts
- [ ] Test server starts: `npm run dev` → `Server running on port 5000`

### Database Init (Supabase + Prisma)
- [ ] Create free Supabase project at supabase.com
- [ ] Copy `DATABASE_URL` from Supabase → paste into `.env`
- [ ] Run `npx prisma init`
- [ ] Write full schema in `prisma/schema.prisma` (all tables from specification.md Section 7)
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Run `npx prisma generate`
- [ ] Create `src/config/db.js` exporting Prisma client singleton
- [ ] Test DB connection with a simple Prisma query

---

## PHASE 1 — BACKEND: AUTH SYSTEM
*Build this before frontend. Frontend needs working API endpoints.*

### Auth Routes & Controllers
- [ ] Create `src/routes/auth.routes.js` — wire up all 7 auth endpoints
- [ ] Create `src/controllers/auth.controller.js`
- [ ] Create `src/utils/asyncHandler.js` — wrap all async funcs
- [ ] Create `src/utils/generateToken.js` — access + refresh JWT logic
- [ ] Create `src/middleware/auth.middleware.js` — verify JWT on protected routes
- [ ] Create `src/middleware/role.middleware.js` — `requireAdmin`, `requireStudent`

### Auth Endpoints (implement one at a time, test with Postman/Thunder Client)
- [ ] `POST /api/auth/register` — hash password, create user, send verification email
- [ ] `POST /api/auth/login` — validate credentials, return access + refresh tokens
- [ ] `POST /api/auth/logout` — invalidate refresh token
- [ ] `GET /api/auth/me` — return authenticated user data (protected)
- [ ] `POST /api/auth/forgot-password` — send reset link email
- [ ] `POST /api/auth/reset-password` — validate token, update password

### Email Service
- [ ] Create `src/services/email.service.js`
- [ ] Setup Nodemailer with Gmail SMTP (or Resend)
- [ ] Write `sendWelcomeEmail(user)` function
- [ ] Write `sendPasswordResetEmail(user, token)` function
- [ ] Write `sendEnrollmentConfirmation(user, course)` function
- [ ] Write `sendClassReminder(user, session)` function

---

## PHASE 2 — BACKEND: COURSES & CONTENT

### Course Endpoints
- [ ] Create `src/routes/course.routes.js`
- [ ] Create `src/controllers/course.controller.js`
- [ ] `GET /api/courses` — return all published courses (public)
- [ ] `GET /api/courses/:id` — return single course with modules (public)
- [ ] `POST /api/courses` — create course (admin only)
- [ ] `PUT /api/courses/:id` — update course (admin only)
- [ ] `DELETE /api/courses/:id` — soft delete course (admin only)
- [ ] `PATCH /api/courses/:id/promo-toggle` — toggle promo free status (admin)

### Modules & Lessons
- [ ] `GET /api/courses/:id/modules` — return modules with lessons (enrolled students + admin)
- [ ] `POST /api/courses/:id/modules` — create module (admin)
- [ ] `PUT /api/modules/:id` — update module (admin)
- [ ] `DELETE /api/modules/:id` — delete module (admin)
- [ ] `POST /api/modules/:id/lessons` — create lesson (admin)
- [ ] `PUT /api/lessons/:id` — update lesson (admin)
- [ ] `DELETE /api/lessons/:id` — delete lesson (admin)
- [ ] `PATCH /api/lessons/:id/complete` — mark lesson complete (student)

### File Upload (Supabase Storage)
- [ ] Install `@supabase/supabase-js`
- [ ] Create `src/config/supabase.js`
- [ ] Create upload endpoint for PDFs and thumbnails
- [ ] Create storage buckets in Supabase: `course-thumbnails`, `lesson-pdfs`
- [ ] Set storage bucket policies (public read for thumbnails, authenticated read for PDFs)

---

## PHASE 3 — BACKEND: BATCH ENROLLMENT

### Batch Routes
- [ ] Create `src/routes/batch.routes.js`
- [ ] Create `src/controllers/batch.controller.js`
- [ ] `GET /api/batches` — return all open batches (public)
- [ ] `GET /api/batches/:id` — return batch details + form schema
- [ ] `POST /api/batches` — create batch (admin)
- [ ] `PUT /api/batches/:id` — update batch (admin)
- [ ] `PATCH /api/batches/:id/status` — open/close registration (admin)
- [ ] `POST /api/batches/:id/enroll` — student submits enrollment form
- [ ] `GET /api/batches/:id/enrollments` — view all submissions (admin)
- [ ] `PATCH /api/enrollments/:id/approve` — approve student (admin)
- [ ] `PATCH /api/enrollments/:id/reject` — reject student (admin)

### Dynamic Form Logic
- [ ] Validate submitted `form_data` against batch's `form_schema` (Zod dynamic schema)
- [ ] Store validated form data in `enrollments.form_data` as JSONB
- [ ] Send approval/rejection email to student when admin acts

---

## PHASE 4 — BACKEND: PAYMENT SYSTEM

### Paystack Integration
- [ ] Create Paystack account and get API keys
- [ ] Add keys to `.env`
- [ ] Create `src/config/paystack.js`
- [ ] Create `src/services/paystack.service.js`
  - [ ] `initiatePayment(email, amount, reference, metadata)` function
  - [ ] `verifyPayment(reference)` function

### Payment Routes
- [ ] Create `src/routes/payment.routes.js`
- [ ] Create `src/controllers/payment.controller.js`
- [ ] `POST /api/payments/initiate` — create pending payment record, return Paystack checkout URL
- [ ] `GET /api/payments/verify/:reference` — verify after Paystack redirect
- [ ] **CRITICAL:** `POST /api/payments/webhook` — implement full lifecycle from constitution.md Section 7
  - [ ] Use `express.raw()` for THIS route ONLY (add before `express.json()`)
  - [ ] HMAC-SHA512 signature verification
  - [ ] Idempotency check (don't process duplicate events)
  - [ ] Update payment → create enrollment → send email → return 200
- [ ] `GET /api/payments` — all transactions (admin only)

### Webhook Testing
- [ ] Install `ngrok` for local webhook testing
- [ ] Test full payment flow end-to-end in test mode
- [ ] Confirm enrollment is created after successful payment

---

## PHASE 5 — BACKEND: ADMIN SYSTEM

### Admin Routes
- [ ] Create `src/routes/admin.routes.js`
- [ ] Create `src/controllers/admin.controller.js`
- [ ] `GET /api/admin/students` — paginated student list
- [ ] `GET /api/admin/students/:id` — student profile + enrollments
- [ ] `PATCH /api/admin/students/:id/suspend` — suspend/unsuspend student
- [ ] `GET /api/admin/dashboard-stats` — total students, revenue, active courses, open batches
- [ ] `POST /api/admin/announcements` — send notification to all/enrolled students

---

## PHASE 6 — FRONTEND: LOVABLE SETUP & LANDING PAGE

### Lovable Project Setup
- [ ] Create new Lovable project (or connect existing)
- [ ] Set API base URL to your backend URL
- [ ] Configure Tailwind with CSS variables from constitution.md Section 2
- [ ] Install/configure shadcn/ui base components
- [ ] Create `src/services/api.js` — Axios instance with base URL and auth interceptors
- [ ] Create `AuthContext.jsx` — global auth state management

### Landing Page (Homepage)
- [ ] Build `Landing.jsx`
  - [ ] **Split-screen hero:** Left half = Forex (dark navy + gold), Right half = Tech (dark navy + electric blue)
  - [ ] Each side: background image (trading charts / code), headline, sub-headline, CTA button
  - [ ] Shared navigation bar with logo + Login + Register buttons
  - [ ] "About MFA" section — your story and mission
  - [ ] Featured courses row (3 forex + 3 tech)
  - [ ] Testimonials section (placeholder for now)
  - [ ] CTA banner: "Join the Academy — Next Batch Opening Soon"
  - [ ] Footer: links, social media, contact

---

## PHASE 7 — FRONTEND: AUTH PAGES

- [ ] `Register.jsx` — name, email, password, confirm password
- [ ] `Login.jsx` — email, password, forgot password link
- [ ] `ForgotPassword.jsx`
- [ ] `ResetPassword.jsx`
- [ ] `VerifyEmail.jsx` — token from email link
- [ ] Connect all forms to auth API endpoints
- [ ] Store tokens in memory (access) and httpOnly cookie (refresh)
- [ ] Redirect after login: students → `/dashboard`, admins → `/admin`

---

## PHASE 8 — FRONTEND: COURSE CATALOG & DETAIL

- [ ] `ForexAcademy.jsx` — course catalog filtered to forex
- [ ] `TechAcademy.jsx` — course catalog filtered to tech
- [ ] `CourseCard.jsx` — reusable card component (thumbnail, title, type badge, price/free tag, CTA)
- [ ] `CourseDetail.jsx` — full course page (description, modules list, instructor, price, enroll button)
- [ ] Logic: if course is free/promo → show "Enroll Free" button; if paid → show "Buy Now"
- [ ] If batch course: check batch status → show form or "Registration Closed" banner

---

## PHASE 9 — FRONTEND: STUDENT DASHBOARD

- [ ] `StudentDashboard.jsx` — overview: enrolled courses, upcoming sessions, progress
- [ ] `MyCourses.jsx` — list of enrolled courses with progress bars
- [ ] Course content player page — modules sidebar + lesson content area (video embed / PDF viewer)
- [ ] Mark lesson complete button
- [ ] `LiveClasses.jsx` — upcoming sessions list; join button unlocks 15min before start
- [ ] `Profile.jsx` — edit name, avatar, password

---

## PHASE 10 — FRONTEND: PAYMENT FLOW

- [ ] `Checkout.jsx` — order summary, student email, "Pay with Paystack" button
- [ ] Call `/api/payments/initiate` → redirect to Paystack
- [ ] `PaymentSuccess.jsx` — verify payment on return, show confirmation
- [ ] `PaymentFailed.jsx` — retry option

---

## PHASE 11 — FRONTEND: ADMIN DASHBOARD

- [ ] `AdminDashboard.jsx` — stats cards (students, revenue, courses, open batches)
- [ ] `ManageCourses.jsx` — table of all courses, CRUD actions, promo toggle
- [ ] Course creation/edit form (full fields from spec)
- [ ] Module + lesson management (drag to reorder)
- [ ] `ManageBatches.jsx` — table of batches, open/close toggle, view enrollments
- [ ] Enrollment review panel — view form submissions, approve/reject buttons
- [ ] `FormBuilder.jsx` — drag-and-drop form field builder for batch registration forms
- [ ] `ManageStudents.jsx` — searchable student table, view profile, suspend action
- [ ] `ManageSessions.jsx` — create/edit/delete live sessions, add recording URL
- [ ] Transactions page — payment history table

---

## PHASE 11B — BACKEND: CHAT SYSTEM (Socket.io)

### Chat Infrastructure
- [ ] Install Socket.io: `npm i socket.io`
- [ ] Create `src/sockets/index.js` — init Socket.io server, attach JWT auth middleware on handshake
- [ ] Create `src/sockets/roomGuard.js` — verify user is a member of room before any action
- [ ] Create `src/sockets/chat.socket.js` — handle all socket events

### Chat Routes & Controllers
- [ ] Create `src/routes/chat.routes.js`
- [ ] Create `src/controllers/chat.controller.js`
- [ ] Create `src/services/chat.service.js`
- [ ] `GET /api/chat/rooms` — return all rooms the authenticated student belongs to
- [ ] `GET /api/chat/rooms/:id/messages` — paginated message history (50 per page)
- [ ] `POST /api/chat/rooms/:id/messages` — send message (also triggers socket emit)
- [ ] `DELETE /api/chat/messages/:id` — delete own message (within 5min) or admin deletes any
- [ ] `PATCH /api/chat/messages/:id/pin` — admin only
- [ ] `POST /api/chat/messages/:id/reactions` — add emoji reaction
- [ ] `DELETE /api/chat/messages/:id/reactions` — remove own reaction
- [ ] `GET /api/admin/chat/rooms` — admin views all rooms
- [ ] `POST /api/admin/chat/rooms` — admin creates lounge/announcement rooms

### Socket Events (server-side)
- [ ] `join_room` — verify membership, join socket room
- [ ] `leave_room` — leave socket room
- [ ] `send_message` — validate, save to DB, broadcast `new_message` to room
- [ ] `typing` / `stop_typing` — broadcast to room (don't save to DB)
- [ ] `add_reaction` — save to DB, broadcast `reaction_updated`

### Auto-Assignment Logic
- [ ] In `payment.controller.js` webhook handler (Step 9): after creating enrollment → call `chat.service.addMemberToBatchRoom(userId, batchId)`
- [ ] In `batch.controller.js` approve handler: after approving → call `chat.service.addMemberToBatchRoom(userId, batchId)`
- [ ] In `chat.service.js`: `addMemberToBatchRoom` — query batch's `chat_room_id`, insert into `chat_members`
- [ ] When batch status set to `completed`: update `chat_rooms.status` to `archived`

### Seed Default Rooms
- [ ] Create DB seed script: insert `#mfa-announcements`, `#forex-lounge`, `#tech-lounge` rooms
- [ ] Run seed: `npx prisma db seed`
- [ ] Test: student enrolls in forex course → check they appear in `#forex-lounge` members

---

## PHASE 11C — FRONTEND: CHAT UI (Lovable)

### Socket.io Client Setup
- [ ] Install: `npm i socket.io-client`
- [ ] Create `src/hooks/useSocket.js` — connect to backend with JWT, expose socket instance
- [ ] Create `src/context/ChatContext.jsx` — active room, unread counts, rooms list
- [ ] Wrap app in `ChatContext.Provider` (authenticated users only)

### Chat Components
- [ ] `ChatSidebar.jsx` — list of user's rooms with unread badge counts
  - [ ] Group by type: Announcements → Lounges → Batch Groups
  - [ ] Active room highlighted
  - [ ] Unread count badge (red dot)
- [ ] `ChatWindow.jsx` — message feed for active room
  - [ ] Load last 50 messages on mount
  - [ ] Infinite scroll (load older messages on scroll up)
  - [ ] Auto-scroll to bottom on new message
  - [ ] Show "read-only archive" banner for completed batch rooms
- [ ] `MessageBubble.jsx` — single message display
  - [ ] Sender avatar + name + timestamp
  - [ ] Message content (text / image / file)
  - [ ] Emoji reactions row
  - [ ] Hover: show reaction picker + delete button (own msgs)
  - [ ] Pin indicator for pinned messages
- [ ] `MessageInput.jsx` — bottom input bar
  - [ ] Text input with Enter to send
  - [ ] Emoji picker button
  - [ ] File/image attachment button (upload to Supabase)
  - [ ] Typing indicator trigger (emit on keydown, stop on blur/send)
- [ ] `TypingIndicator.jsx` — "Muaishaq is typing..." display
- [ ] `PinnedMessage.jsx` — pinned message banner at top of chat window

### Chat Page Integration
- [ ] Add "Community" tab to student dashboard sidebar
- [ ] `CommunityPage.jsx` — split layout: ChatSidebar (left) + ChatWindow (right)
- [ ] Mobile: full-screen room list → tap room → full-screen chat (back button)
- [ ] Admin: sees all rooms in sidebar, has moderation controls on every message

---

## PHASE 11D — PWA SETUP

### Vite PWA Plugin
- [ ] Install: `npm i -D vite-plugin-pwa`
- [ ] Configure `vite.config.js` with PWA plugin
- [ ] Create `public/manifest.json` with MFA branding (navy bg, gold/blue icon)
- [ ] Generate PWA icons: 192x192 and 512x512 PNG (use your MFA logo)
- [ ] Configure service worker caching strategies (Cache First for assets, Network First for API)
- [ ] Create `offline.html` — branded offline fallback page
- [ ] Test: build and serve, check Lighthouse PWA score (target: 90+)

### Push Notifications
- [ ] Install: `npm i web-push` (backend)
- [ ] Generate VAPID keys: `npx web-push generate-vapid-keys` → save to `.env`
- [ ] Create `src/services/push.service.js` — send push to subscribed users
- [ ] Add `push_subscriptions` table to Prisma schema (user_id, endpoint, keys)
- [ ] `POST /api/push/subscribe` — save student's push subscription
- [ ] Trigger push on: new chat message (when user is offline), class reminder (24h before)
- [ ] Frontend: after login, prompt user to enable notifications → call subscribe endpoint

### PWA Install Banner
- [ ] Create `InstallBanner.jsx` — custom "Install MFA App" banner in dashboard header
- [ ] Listen for `beforeinstallprompt` event → store it → show custom banner
- [ ] On banner click → trigger install prompt
- [ ] After install → hide banner permanently (localStorage flag)
- [ ] iOS: show manual instruction modal ("Tap Share → Add to Home Screen")

---

---

## PHASE 12 — DEPLOYMENT

### Backend Deployment (Railway or Render)
- [ ] Create account on Railway.app
- [ ] Connect GitHub repo
- [ ] Set all environment variables in Railway dashboard
- [ ] Run migrations on production DB: `npx prisma migrate deploy`
- [ ] Deploy backend — note the production URL
- [ ] Register Paystack webhook URL: `https://your-backend.railway.app/api/payments/webhook`
- [ ] Test webhook in Paystack dashboard

### Frontend Deployment (Vercel)
- [ ] Export Lovable project or connect repo to Vercel
- [ ] Set `VITE_API_URL` to production backend URL
- [ ] Set `VITE_PAYSTACK_PUBLIC_KEY` to production key
- [ ] Deploy frontend — note the production URL
- [ ] Update CORS in backend to allow frontend domain only

### Jitsi Live Classes — Phase 1 (Free, no server needed)
- [ ] No deployment needed — using meet.jit.si public servers
- [ ] In session creation, auto-generate room name: `mfa-{academy}-{nanoid}`
- [ ] Store room name in `live_sessions.jitsi_room`
- [ ] Join button constructs URL: `https://meet.jit.si/{jitsi_room}`
- [ ] Open in new tab OR embed via Jitsi IFrame API (your choice at build time)
- [ ] Join button only visible to enrolled students, 15min before session start

### Jitsi Phase 2 (Self-Hosted — defer until platform is generating revenue)
- [ ] Provision $5/month VPS (Contabo or DigitalOcean)
- [ ] Install self-hosted Jitsi on VPS
- [ ] Configure custom domain: `meet.mfaacademy.com`
- [ ] Enable JWT authentication on Jitsi
- [ ] Update backend to issue moderator/participant JWT tokens
- [ ] Update frontend room URL to use custom domain

### Final Checks
- [ ] End-to-end test: register → enroll free course → access content
- [ ] End-to-end test: register → buy paid course → Paystack → access granted
- [ ] End-to-end test: admin creates batch → student enrolls → admin approves → student gets email
- [ ] Mobile responsiveness check (Chrome DevTools)
- [ ] SSL certificate active on both domains
- [ ] Create first admin account via Prisma Studio or seed script

---

## EXECUTION COMMAND

> **Start with:** Phase 0, Step 1 — Create folder structure  
> **Ask me:** "I'm ready to execute Phase [X], Step [Y] — give me the code"  
> **I will give you:** Exact code, file by file, copy-paste ready

---

*Progress: 0 / ~120 tasks complete*  
*Last updated: 2026-06-26*
