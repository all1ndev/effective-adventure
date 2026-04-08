ALTER TABLE "patient" ADD COLUMN "immunosuppressant_details" json DEFAULT '{}'::json;--> statement-breakpoint
ALTER TABLE "patient" ADD COLUMN "antiviral_details" json DEFAULT '{}'::json;