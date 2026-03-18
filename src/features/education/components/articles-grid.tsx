import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { type Article } from "../data/schema";

interface ArticlesGridProps {
	articles: Article[];
	onSelect?: (id: string) => void;
}

const categoryLabels: Record<string, string> = {
	"nutritie": "Nutritie",
	"medicatie": "Medicatie",
	"stil-de-viata": "Stil de viata",
	"complicatii": "Complicatii",
	"recuperare": "Recuperare",
};

export function ArticlesGrid({ articles, onSelect }: ArticlesGridProps) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{articles.map((article) => (
				<Card
					key={article.id}
					className="cursor-pointer transition-shadow hover:shadow-md"
					onClick={() => onSelect?.(article.id)}
				>
					<CardHeader className="pb-2">
						<div className="flex items-start justify-between gap-2">
							<CardTitle className="text-base leading-snug">
								{article.title}
							</CardTitle>
						</div>
						<div className="flex items-center gap-2">
							<Badge variant="secondary" className="text-xs">
								{categoryLabels[article.category]}
							</Badge>
							<span className="flex items-center gap-1 text-xs text-muted-foreground">
								<Clock className="h-3 w-3" />
								{article.readTime} min
							</span>
						</div>
					</CardHeader>
					<CardContent>
						<CardDescription className="line-clamp-3 text-sm">
							{article.content.replace(/\*\*/g, "").slice(0, 120)}...
						</CardDescription>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
