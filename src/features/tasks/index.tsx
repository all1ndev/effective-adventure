import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { SarciniDialogs } from "./components/tasks-dialogs";
import { SarciniPrimaryButtons } from "./components/tasks-primary-buttons";
import { SarciniProvider } from "./components/tasks-provider";
import { SarciniTable } from "./components/tasks-table";
import { tasks } from "./data/tasks";

export function Sarcini() {
	return (
		<SarciniProvider>
			<Header fixed>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ThemeSwitch />
					<ConfigDrawer />
					<ProfileDropdown />
				</div>
			</Header>

			<Main className="flex flex-1 flex-col gap-4 sm:gap-6">
				<div className="flex flex-wrap items-end justify-between gap-2">
					<div>
						<h2 className="text-2xl font-bold tracking-tight">Sarcini</h2>
						<p className="text-muted-foreground">
							Here&apos;s a list of your tasks for this month!
						</p>
					</div>
					<SarciniPrimaryButtons />
				</div>
				<SarciniTable data={tasks} />
			</Main>

			<SarciniDialogs />
		</SarciniProvider>
	);
}
