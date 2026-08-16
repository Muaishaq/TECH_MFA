-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_courses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "academy" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" DECIMAL NOT NULL DEFAULT 0,
    "thumbnail_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "promo_expires" DATETIME,
    "prerequisites" TEXT,
    "duration" TEXT,
    "schedule" TEXT,
    "level" TEXT NOT NULL DEFAULT 'beginner',
    "certificate" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_courses" ("academy", "created_at", "description", "id", "is_published", "price", "promo_expires", "thumbnail_url", "title", "type", "updated_at") SELECT "academy", "created_at", "description", "id", "is_published", "price", "promo_expires", "thumbnail_url", "title", "type", "updated_at" FROM "courses";
DROP TABLE "courses";
ALTER TABLE "new_courses" RENAME TO "courses";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
