"use client";

import { useEffect, useState } from "react";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { JournalEditor } from "./components/journal-editor";
import { JournalList } from "./components/journal-list";
import { getJournalEntries } from "./actions";
import type { JournalEntry } from "./data/schema";

export function Journal() {
	const [entries, setEntries] = useState<JournalEntry[]>([]);

	function fetchData() {
		getJournalEntries().then(setEntries);
	}

	 
	useEffect(fetchData, []);

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
					<h2 className="text-2xl font-bold tracking-tight">Jurnal</h2>
					<p className="text-muted-foreground">
						Jurnalul personal de sanatate — stare, note si observatii zilnice.
					</p>
				</div>
				<JournalEditor onSuccess={fetchData} />
				<div>
					<h3 className="mb-3 text-lg font-semibold">Intrari anterioare</h3>
					<JournalList entries={entries} />
				</div>
			</Main>
		</>
	);
}
