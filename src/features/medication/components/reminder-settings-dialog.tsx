"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ReminderTimesEditor } from "./reminder-times-editor";

interface ReminderSettingsDialogProps {
	medicationId: string;
	medicationName: string;
	frequency: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSaved?: () => void;
}

export function ReminderSettingsDialog({
	medicationId,
	medicationName,
	frequency,
	open,
	onOpenChange,
	onSaved,
}: ReminderSettingsDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Notificări — {medicationName}</DialogTitle>
					<DialogDescription>
						Setează ora la care vrei să fii notificat pentru fiecare doză.
					</DialogDescription>
				</DialogHeader>
				<ReminderTimesEditor
					medicationId={medicationId}
					frequency={frequency}
					onSaved={onSaved}
				/>
			</DialogContent>
		</Dialog>
	);
}
