ALTER TABLE "patient" DROP CONSTRAINT "patient_doctor_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_doctor_id_user_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;