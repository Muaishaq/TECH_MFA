-- Add performance indexes for database optimization
-- These indexes improve query performance without breaking existing functionality

-- User table indexes
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");
CREATE INDEX IF NOT EXISTS "users_academy_idx" ON "users"("academy");
CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users"("created_at");

-- Course table indexes
CREATE INDEX IF NOT EXISTS "courses_academy_idx" ON "courses"("academy");
CREATE INDEX IF NOT EXISTS "courses_is_published_idx" ON "courses"("is_published");
CREATE INDEX IF NOT EXISTS "courses_created_at_idx" ON "courses"("created_at");

-- Enrollment table indexes
CREATE INDEX IF NOT EXISTS "enrollments_student_id_idx" ON "enrollments"("student_id");
CREATE INDEX IF NOT EXISTS "enrollments_course_id_idx" ON "enrollments"("course_id");
CREATE INDEX IF NOT EXISTS "enrollments_status_idx" ON "enrollments"("status");
CREATE INDEX IF NOT EXISTS "enrollments_enrolled_at_idx" ON "enrollments"("enrolled_at");

-- Payment table indexes
CREATE INDEX IF NOT EXISTS "payments_student_id_idx" ON "payments"("student_id");
CREATE INDEX IF NOT EXISTS "payments_course_id_idx" ON "payments"("course_id");
CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments"("status");
CREATE INDEX IF NOT EXISTS "payments_created_at_idx" ON "payments"("created_at");

-- Notification table indexes
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notifications"("is_read");
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications"("created_at");
