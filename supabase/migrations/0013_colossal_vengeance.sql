CREATE TABLE "notification_queue" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"sent" boolean DEFAULT false NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_queue" ADD CONSTRAINT "notification_queue_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscription" ADD CONSTRAINT "push_subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_queue_scheduledFor_idx" ON "notification_queue" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "notification_queue_userId_idx" ON "notification_queue" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_queue_sent_idx" ON "notification_queue" USING btree ("sent");--> statement-breakpoint
CREATE INDEX "push_subscription_userId_idx" ON "push_subscription" USING btree ("user_id");