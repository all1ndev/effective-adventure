import Link from "next/link";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TopNavProps = React.HTMLAttributes<HTMLElement> & {
	links: {
		title: string;
		href: string;
		isActive: boolean;
		disabled?: boolean;
	}[];
};

export function TopNav({ className, links, ...props }: TopNavProps) {
	return (
		<>
			<div className="lg:hidden">
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<Button size="icon" variant="outline" className="md:size-7">
							<Menu />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent side="bottom" align="start">
						{links.map(({ title, href, isActive, disabled }) => {
							const itemClass = !isActive ? "text-muted-foreground" : "";
							if (disabled) {
								return (
									<DropdownMenuItem
										key={`${title}-${href}`}
										disabled
										className={itemClass}
									>
										{title}
									</DropdownMenuItem>
								);
							}

							return (
								<DropdownMenuItem key={`${title}-${href}`} asChild>
									<Link href={href} className={itemClass}>
										{title}
									</Link>
								</DropdownMenuItem>
							);
						})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<nav
				className={cn(
					"hidden items-center space-x-4 lg:flex lg:space-x-4 xl:space-x-6",
					className,
				)}
				{...props}
			>
				{links.map(({ title, href, isActive, disabled }) => {
					const className = `text-sm font-medium transition-colors hover:text-primary ${isActive ? "" : "text-muted-foreground"} ${disabled ? "pointer-events-none opacity-60" : ""}`;
					if (disabled) {
						return (
							<span
								key={`${title}-${href}`}
								aria-disabled
								className={className}
							>
								{title}
							</span>
						);
					}

					return (
						<Link key={`${title}-${href}`} href={href} className={className}>
							{title}
						</Link>
					);
				})}
			</nav>
		</>
	);
}
