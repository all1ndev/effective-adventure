ALTER TYPE "public"."audit_entity" ADD VALUE 'medication_reminder';--> statement-breakpoint
CREATE TABLE "medication_reminder" (
	"id" text PRIMARY KEY NOT NULL,
	"medication_id" text NOT NULL,
	"dose_index" integer NOT NULL,
	"time" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "medication_reminder_med_dose_uq" UNIQUE("medication_id","dose_index")
);
--> statement-breakpoint
ALTER TABLE "medication_reminder" ADD CONSTRAINT "medication_reminder_medication_id_medication_id_fk" FOREIGN KEY ("medication_id") REFERENCES "public"."medication"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "medication_reminder_medicationId_idx" ON "medication_reminder" USING btree ("medication_id");