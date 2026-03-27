"use client";

import { useState } from "react";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ArticlesGrid } from "./components/articles-grid";
import { ArticleDetail } from "./components/article-detail";
import { articles } from "./data/articles";

export function Education() {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const selected = articles.find((a) => a.id === selectedId);

	return (
		<>
			<Header fixed>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ThemeSwitch />
					<ConfigDrawer />
				</div>
			</Header>

			<Main className="flex flex-1 flex-col gap-6">
				{selected ? (
					<ArticleDetail
						article={selected}
						onBack={() => setSelectedId(null)}
					/>
				) : (
					<>
						<div>
							<h2 className="text-2xl font-bold tracking-tight">Educatie</h2>
							<p className="text-muted-foreground">
								Resurse si informatii despre ingrijirea post-transplant.
							</p>
						</div>
						<ArticlesGrid articles={articles} onSelect={setSelectedId} />
					</>
				)}
			</Main>
		</>
	);
}
