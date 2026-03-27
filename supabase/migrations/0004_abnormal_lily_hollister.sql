CREATE TYPE "public"."vital_status" AS ENUM('normal', 'warning', 'critical');--> statement-breakpoint
ALTER TABLE "vital_sign" ADD COLUMN "status" "vital_status" DEFAULT 'normal' NOT NULL;