import { RoleGuard } from "@/components/role-guard";
import { SendLabResults } from "@/features/send-lab-results";

export default function SendLabResultsPage() {
	return (
		<RoleGuard allowedRoles={["admin", "doctor"]}>
			<SendLabResults />
		</RoleGuard>
	);
}
