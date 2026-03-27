CREATE TYPE "public"."donor_status" AS ENUM('pozitiv', 'negativ', 'necunoscut');--> statement-breakpoint
CREATE TYPE "public"."donor_type" AS ENUM('cadaveric', 'viu');--> statement-breakpoint
CREATE TYPE "public"."hb_ig_route" AS ENUM('iv', 'sc');--> statement-breakpoint
CREATE TYPE "public"."preferred_language" AS ENUM('ro', 'en', 'it', 'fr', 'de');--> statement-breakpoint
CREATE TYPE "public"."rejection_type" AS ENUM('acut', 'cronic');--> statement-breakpoint
ALTER TABLE "patient" ALTER COLUMN "status" SET DEFAULT 'activ';--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "doctor_id" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "patient_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "weight_kg" real;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "height_cm" real;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "bmi" real;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "nationality" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "preferred_language" "preferred_language" DEFAULT 'ro';--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "etiology_other" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "donor_type" "donor_type";--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "donor_anti_hbc" "donor_status";--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "donor_hbs_ag" "donor_status";--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "rejection_history" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "rejection_date" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "rejection_type" "rejection_type";--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "major_complications" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "immunosuppressants" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "antiviral_prophylaxis" json DEFAULT '[]'::json;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "hb_ig" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "hb_ig_route" "hb_ig_route";--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "hb_ig_frequency" text;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "other_meds" text;--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_doctor_id_user_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "patient_user_id_idx" ON "patient" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "patient_doctor_id_idx" ON "patient" USING btree ("doctor_id");