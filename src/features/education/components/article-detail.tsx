import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Article } from "../data/schema";

interface ArticleDetailProps {
	article: Article;
	onBack?: () => void;
}

const categoryLabels: Record<string, string> = {
	"nutritie": "Nutriție",
	"medicatie": "Medicație",
	"stil-de-viata": "Stil de viață",
	"complicatii": "Complicații",
	"recuperare": "Recuperare",
};

export function ArticleDetail({ article, onBack }: ArticleDetailProps) {
	return (
		<div className="space-y-4">
			{onBack && (
				<Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
					<ArrowLeft className="h-4 w-4" />
					Înapoi la articole
				</Button>
			)}
			<div className="space-y-2">
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="secondary">{categoryLabels[article.category]}</Badge>
					<span className="flex items-center gap-1 text-sm text-muted-foreground">
						<Clock className="h-3.5 w-3.5" />
						{article.readTime} minute de citit
					</span>
				</div>
				<h1 className="text-2xl font-bold">{article.title}</h1>
			</div>
			<div className="prose prose-sm dark:prose-invert max-w-none">
				{article.content.split("\n\n").map((paragraph, i) => (
					<p
						key={i}
						className="mb-4 text-sm leading-relaxed text-foreground/90"
					>
						{paragraph}
					</p>
				))}
			</div>
		</div>
	);
}
