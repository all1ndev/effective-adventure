CREATE TABLE IF NOT EXISTS "vital_sign" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"date" text NOT NULL,
	"systolic" integer NOT NULL,
	"diastolic" integer NOT NULL,
	"temperature" real NOT NULL,
	"pulse" integer NOT NULL,
	"weight" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vital_sign" ADD CONSTRAINT "vital_sign_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vital_sign_patientId_idx" ON "vital_sign" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vital_sign_date_idx" ON "vital_sign" USING btree ("date");
