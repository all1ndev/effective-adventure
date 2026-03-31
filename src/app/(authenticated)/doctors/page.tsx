import { RoleGuard } from "@/components/role-guard";
import { Doctors } from "@/features/doctors";

export default function DoctorsPage() {
	return (
		<RoleGuard allowedRoles={["admin"]}>
			<Doctors />
		</RoleGuard>
	);
}
