CREATE TABLE IF NOT EXISTS "teacher_reviews" (
  "id" text PRIMARY KEY NOT NULL,
  "teacher_id" text NOT NULL,
  "user_id" text REFERENCES "user"("id") ON DELETE cascade,
  "author_name" text,
  "knowledge" numeric(3, 1),
  "communication" numeric(3, 1),
  "leniency" numeric(3, 1),
  "fairness" numeric(3, 1),
  "vibe" numeric(3, 1),
  "overall" numeric(3, 1),
  "comment" text DEFAULT '' NOT NULL,
  "liked" text DEFAULT '' NOT NULL,
  "difficult" text DEFAULT '' NOT NULL,
  "exam_process" text DEFAULT '' NOT NULL,
  "advice" text DEFAULT '' NOT NULL,
  "anonymous" boolean DEFAULT false NOT NULL,
  "anonymous_number" integer,
  "status" text DEFAULT 'approved' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "teacher_reviews_knowledge_range_check" CHECK ("knowledge" IS NULL OR ("knowledge" >= 1 AND "knowledge" <= 5)),
  CONSTRAINT "teacher_reviews_communication_range_check" CHECK ("communication" IS NULL OR ("communication" >= 1 AND "communication" <= 5)),
  CONSTRAINT "teacher_reviews_leniency_range_check" CHECK ("leniency" IS NULL OR ("leniency" >= 1 AND "leniency" <= 5)),
  CONSTRAINT "teacher_reviews_fairness_range_check" CHECK ("fairness" IS NULL OR ("fairness" >= 1 AND "fairness" <= 5)),
  CONSTRAINT "teacher_reviews_vibe_range_check" CHECK ("vibe" IS NULL OR ("vibe" >= 1 AND "vibe" <= 5)),
  CONSTRAINT "teacher_reviews_overall_range_check" CHECK ("overall" IS NULL OR ("overall" >= 1 AND "overall" <= 5))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "teacher_reviews_teacher_id_idx" ON "teacher_reviews" ("teacher_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "teacher_reviews_teacher_status_created_idx" ON "teacher_reviews" ("teacher_id", "status", "created_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "teacher_reviews_status_teacher_idx" ON "teacher_reviews" ("status", "teacher_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "teacher_reviews_user_id_idx" ON "teacher_reviews" ("user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "teacher_reviews_user_teacher_idx" ON "teacher_reviews" ("user_id", "teacher_id") WHERE "user_id" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "teacher_reviews_user_teacher_status_idx" ON "teacher_reviews" ("user_id", "teacher_id", "status") WHERE "user_id" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "teacher_reviews_anonymous_number_idx" ON "teacher_reviews" ("teacher_id", "anonymous_number") WHERE "user_id" IS NULL AND "anonymous" = true;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teacher_favorites" (
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "teacher_id" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "teacher_favorites_user_id_teacher_id_pk" PRIMARY KEY("user_id", "teacher_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teacher_review_likes" (
  "review_id" text NOT NULL REFERENCES "teacher_reviews"("id") ON DELETE cascade,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "teacher_review_likes_review_id_user_id_pk" PRIMARY KEY("review_id", "user_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "teacher_review_likes_review_id_idx" ON "teacher_review_likes" ("review_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "teacher_review_likes_user_id_idx" ON "teacher_review_likes" ("user_id");
