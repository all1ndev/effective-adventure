import { RoleGuard } from "@/components/role-guard";
import { DoctorPatients } from "@/features/add-patient";
import { getAdmins } from "@/features/patients/actions";

export default async function DoctorPage() {
	const admins = await getAdmins();

	return (
		<RoleGuard allowedRoles={["admin", "doctor"]}>
			<DoctorPatients admins={admins} />
		</RoleGuard>
	);
}
