CREATE TYPE "public"."alert_severity" AS ENUM('critical', 'warning', 'info');--> statement-breakpoint
CREATE TYPE "public"."alert_type" AS ENUM('vital', 'simptom', 'laborator', 'medicatie');--> statement-breakpoint
CREATE TYPE "public"."etiology" AS ENUM('HBV', 'HDV', 'HCV', 'MASLD', 'alcool', 'autoimuna', 'altele');--> statement-breakpoint
CREATE TYPE "public"."medication_log_status" AS ENUM('luat', 'omis', 'intarziat');--> statement-breakpoint
CREATE TYPE "public"."mood" AS ENUM('excelent', 'bine', 'neutru', 'rau', 'foarte-rau');--> statement-breakpoint
CREATE TYPE "public"."patient_status" AS ENUM('activ', 'inactiv');--> statement-breakpoint
CREATE TYPE "public"."sex" AS ENUM('masculin', 'feminin', 'nespecificat');--> statement-breakpoint
CREATE TABLE "alert" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"patient_name" text NOT NULL,
	"type" "alert_type" NOT NULL,
	"severity" "alert_severity" NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"dismissed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinical_note" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"visit_date" text NOT NULL,
	"content" text NOT NULL,
	"author" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"patient_name" text NOT NULL,
	"last_message" text DEFAULT '' NOT NULL,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"unread_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journal_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" text NOT NULL,
	"mood" "mood" NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lab_result" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"date" text NOT NULL,
	"tests" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medication" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"name" text NOT NULL,
	"dose" text NOT NULL,
	"frequency" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medication_log" (
	"id" text PRIMARY KEY NOT NULL,
	"medication_id" text NOT NULL,
	"taken_at" text NOT NULL,
	"status" "medication_log_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"sender_name" text NOT NULL,
	"body" text NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"read" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient" (
	"id" text PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"patient_phone" text,
	"sex" "sex" NOT NULL,
	"age" integer,
	"etiology" "etiology",
	"transplant_date" text,
	"status" "patient_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alert" ADD CONSTRAINT "alert_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_note" ADD CONSTRAINT "clinical_note_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entry" ADD CONSTRAINT "journal_entry_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_result" ADD CONSTRAINT "lab_result_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication" ADD CONSTRAINT "medication_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medication_log" ADD CONSTRAINT "medication_log_medication_id_medication_id_fk" FOREIGN KEY ("medication_id") REFERENCES "public"."medication"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alert_patientId_idx" ON "alert" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "alert_severity_idx" ON "alert" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "clinical_note_patientId_idx" ON "clinical_note" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "clinical_note_visitDate_idx" ON "clinical_note" USING btree ("visit_date");--> statement-breakpoint
CREATE INDEX "conversation_patientId_idx" ON "conversation" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "journal_entry_userId_idx" ON "journal_entry" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "journal_entry_date_idx" ON "journal_entry" USING btree ("date");--> statement-breakpoint
CREATE INDEX "lab_result_patientId_idx" ON "lab_result" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "lab_result_date_idx" ON "lab_result" USING btree ("date");--> statement-breakpoint
CREATE INDEX "medication_patientId_idx" ON "medication" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "medicationLog_medicationId_idx" ON "medication_log" USING btree ("medication_id");--> statement-breakpoint
CREATE INDEX "message_conversationId_idx" ON "message" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "patient_status_idx" ON "patient" USING btree ("status");