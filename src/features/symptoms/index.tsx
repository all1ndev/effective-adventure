import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { SymptomsForm } from "./components/symptoms-form";
import { SymptomsList } from "./components/symptoms-list";
import { symptomReports } from "./data/symptoms";

export function Symptoms() {
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
					<h2 className="text-2xl font-bold tracking-tight">Simptome</h2>
					<p className="text-muted-foreground">
						Raportati simptomele zilnice pentru monitorizare medicala.
					</p>
				</div>
				<SymptomsForm />
				<div>
					<h3 className="mb-3 text-lg font-semibold">Istoric rapoarte</h3>
					<SymptomsList data={symptomReports} />
				</div>
			</Main>
		</>
	);
}
