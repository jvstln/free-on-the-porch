CREATE TYPE "listing_category" AS ENUM('FURNITURE', 'ELECTRONICS', 'CLOTHING', 'BOOKS', 'TOYS', 'KITCHEN', 'SPORTS', 'TOOLS', 'GARDEN', 'OTHER');--> statement-breakpoint
CREATE TYPE "listing_condition" AS ENUM('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'WORN');--> statement-breakpoint
CREATE TYPE "listing_status" AS ENUM('AVAILABLE', 'RESERVED', 'PICKED_UP', 'EXPIRED', 'REMOVED');--> statement-breakpoint
CREATE TYPE "notification_type" AS ENUM('NEW_NEARBY_LISTING', 'MESSAGE_RECEIVED', 'COMMENT_ON_LISTING', 'LISTING_EXPIRED');--> statement-breakpoint
CREATE TYPE "report_reason" AS ENUM('SPAM', 'INAPPROPRIATE', 'ALREADY_TAKEN', 'FAKE', 'OTHER');--> statement-breakpoint
CREATE TYPE "thread_type" AS ENUM('DM', 'LISTING');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"bio" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comment" (
	"id" text PRIMARY KEY,
	"body" varchar(500) NOT NULL,
	"userId" text NOT NULL,
	"listingId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing" (
	"id" text PRIMARY KEY,
	"title" varchar(80) NOT NULL,
	"description" text,
	"category" "listing_category" NOT NULL,
	"condition" "listing_condition" NOT NULL,
	"status" "listing_status" DEFAULT 'AVAILABLE'::"listing_status" NOT NULL,
	"location" geography(Point,4326) NOT NULL,
	"address" varchar(200),
	"expiresAt" timestamp NOT NULL,
	"userId" text NOT NULL,
	"claimedByUserId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "status_claimed_by_user_id_check" CHECK ((((("status" in ('PICKED_UP', 'RESERVED')) and (("claimedByUserId" is not null)))) or ((("status" not in ('PICKED_UP', 'RESERVED')) and (("claimedByUserId" is null))))))
);
--> statement-breakpoint
CREATE TABLE "listing_claim_request" (
	"id" text PRIMARY KEY,
	"listingId" text NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_image" (
	"id" text PRIMARY KEY,
	"url" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"listingId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" text PRIMARY KEY,
	"body" varchar(1000) NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"senderId" text NOT NULL,
	"threadId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY,
	"type" "notification_type" NOT NULL,
	"title" varchar(100) NOT NULL,
	"body" varchar(300) NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"data" jsonb,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "thread" (
	"id" text PRIMARY KEY,
	"type" "thread_type" NOT NULL,
	"listingId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "thread_type_check" CHECK ((("type" in ('DM')) or ((("type" = 'LISTING') and (("listingId" is not null))))))
);
--> statement-breakpoint
CREATE TABLE "thread_member" (
	"id" text PRIMARY KEY,
	"threadId" text NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "block" (
	"id" text PRIMARY KEY,
	"blockerId" text NOT NULL,
	"blockedId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report" (
	"id" text PRIMARY KEY,
	"reason" "report_reason" NOT NULL,
	"details" varchar(300),
	"resolved" boolean DEFAULT false NOT NULL,
	"reportedById" text NOT NULL,
	"reportedUserId" text,
	"listingId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("userId");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("userId");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE INDEX "listing_status_expiresAt_idx" ON "listing" ("status","expiresAt");--> statement-breakpoint
CREATE INDEX "listing_user_idx" ON "listing" ("userId");--> statement-breakpoint
CREATE INDEX "listing_category_idx" ON "listing" ("category");--> statement-breakpoint
CREATE INDEX "message_senderId_idx" ON "message" ("senderId");--> statement-breakpoint
CREATE INDEX "message_threadId_idx" ON "message" ("threadId");--> statement-breakpoint
CREATE INDEX "notification_userId_read_idx" ON "notification" ("userId","read");--> statement-breakpoint
CREATE INDEX "thread_listingId_idx" ON "thread" ("listingId");--> statement-breakpoint
CREATE UNIQUE INDEX "block_blockerId_blockedId_key" ON "block" ("blockerId","blockedId");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_listingId_listing_id_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "listing" ADD CONSTRAINT "listing_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "listing" ADD CONSTRAINT "listing_claimedByUserId_user_id_fkey" FOREIGN KEY ("claimedByUserId") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "listing_claim_request" ADD CONSTRAINT "listing_claim_request_listingId_listing_id_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "listing_claim_request" ADD CONSTRAINT "listing_claim_request_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "listing_image" ADD CONSTRAINT "listing_image_listingId_listing_id_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_senderId_user_id_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_threadId_thread_id_fkey" FOREIGN KEY ("threadId") REFERENCES "thread"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "thread" ADD CONSTRAINT "thread_listingId_listing_id_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "thread_member" ADD CONSTRAINT "thread_member_threadId_thread_id_fkey" FOREIGN KEY ("threadId") REFERENCES "thread"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "thread_member" ADD CONSTRAINT "thread_member_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "block" ADD CONSTRAINT "block_blockerId_user_id_fkey" FOREIGN KEY ("blockerId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "block" ADD CONSTRAINT "block_blockedId_user_id_fkey" FOREIGN KEY ("blockedId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_reportedById_user_id_fkey" FOREIGN KEY ("reportedById") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_reportedUserId_user_id_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "user"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_listingId_listing_id_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE SET NULL;