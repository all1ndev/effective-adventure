import { RoleGuard } from "@/components/role-guard";
import { AddDoctor } from "@/features/add-doctor";

export default function AddDoctorPage() {
	return (
		<RoleGuard allowedRoles={["admin"]}>
			<AddDoctor />
		</RoleGuard>
	);
}
