import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type JournalEntry } from "../data/schema";

interface JournalListProps {
	entries: JournalEntry[];
	onSelect?: (id: string) => void;
}

const moodConfig = {
	"excelent": { emoji: "😄", label: "Excelent", color: "text-green-600" },
	"bine": { emoji: "🙂", label: "Bine", color: "text-emerald-600" },
	"neutru": { emoji: "😐", label: "Neutru", color: "text-muted-foreground" },
	"rau": { emoji: "😕", label: "Rău", color: "text-orange-600" },
	"foarte-rau": { emoji: "😞", label: "Foarte rău", color: "text-destructive" },
};

export function JournalList({ entries, onSelect }: JournalListProps) {
	return (
		<div className="space-y-3">
			{entries.map((entry) => {
				const mood = moodConfig[entry.mood];
				return (
					<Card
						key={entry.id}
						className="cursor-pointer transition-shadow hover:shadow-sm"
						onClick={() => onSelect?.(entry.id)}
					>
						<CardHeader className="pb-2">
							<div className="flex items-center justify-between">
								<CardTitle className="text-sm font-medium">
									{new Date(entry.date).toLocaleDateString("ro-RO", {
										weekday: "long",
										day: "numeric",
										month: "long",
									})}
								</CardTitle>
								<span
									className={`flex items-center gap-1 text-sm ${mood.color}`}
								>
									<span>{mood.emoji}</span>
									<span>{mood.label}</span>
								</span>
							</div>
						</CardHeader>
						<CardContent>
							<p className="line-clamp-2 text-sm text-muted-foreground">
								{entry.content}
							</p>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
