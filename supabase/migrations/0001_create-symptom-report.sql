CREATE TYPE "public"."severity" AS ENUM('usoara', 'moderata', 'severa');--> statement-breakpoint
CREATE TABLE "symptom_report" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"date" text NOT NULL,
	"symptoms" json NOT NULL,
	"severity" "severity" NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "symptom_report" ADD CONSTRAINT "symptom_report_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "symptom_report_patientId_idx" ON "symptom_report" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "symptom_report_date_idx" ON "symptom_report" USING btree ("date");