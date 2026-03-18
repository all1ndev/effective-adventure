import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { PatientsTable } from "./components/patients-table";
import { patients } from "./data/patients";

export function Patients() {
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

			<Main className="flex flex-1 flex-col gap-4 sm:gap-6">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Lista Pacienti</h2>
					<p className="text-muted-foreground">
						Vizualizati si gestionati pacientii cu transplant hepatic.
					</p>
				</div>
				<PatientsTable data={patients} />
			</Main>
		</>
	);
}
