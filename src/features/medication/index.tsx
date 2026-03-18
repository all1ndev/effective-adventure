import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { MedicationCalendar } from "./components/medication-calendar";
import { ComplianceTable } from "./components/compliance-table";
import { RenewalAlert } from "./components/renewal-alert";
import { medications, medicationLogs } from "./data/medications";

export function Medication() {
	return (
		<>
			<Header fixed>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ThemeSwitch />
					<ConfigDrawer />
					<ProfileDropdown />
				</div>
			</Header>

			<Main className="flex flex-1 flex-col gap-6">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Medicatie</h2>
					<p className="text-muted-foreground">
						Schema de medicatie si istoricul de conformitate.
					</p>
				</div>
				<RenewalAlert medications={medications} />
				<MedicationCalendar medications={medications} logs={medicationLogs} />
				<ComplianceTable medications={medications} logs={medicationLogs} />
			</Main>
		</>
	);
}
