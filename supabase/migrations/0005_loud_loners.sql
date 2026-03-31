CREATE TYPE "public"."doctor_status" AS ENUM('activ', 'inactiv');--> statement-breakpoint
CREATE TABLE "doctor" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"specialization" text,
	"phone" text,
	"license_number" text,
	"status" "doctor_status" DEFAULT 'activ' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lab_result" ADD COLUMN "pdf_file_name" text;--> statement-breakpoint
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "doctor_user_id_idx" ON "doctor" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "doctor_status_idx" ON "doctor" USING btree ("status");