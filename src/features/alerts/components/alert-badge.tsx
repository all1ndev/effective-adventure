import { Badge } from "@/components/ui/badge";
import { type AlertSeverity } from "../data/schema";

interface AlertBadgeProps {
	severity: AlertSeverity;
}

const config = {
	critical: {
		label: "Critic",
		className:
			"bg-destructive text-destructive-foreground hover:bg-destructive/90",
	},
	warning: {
		label: "Atenție",
		className: "bg-orange-500 text-white hover:bg-orange-500/90",
	},
	info: {
		label: "Info",
		className: "bg-blue-500 text-white hover:bg-blue-500/90",
	},
};

export function AlertBadge({ severity }: AlertBadgeProps) {
	const { label, className } = config[severity];
	return <Badge className={className}>{label}</Badge>;
}
