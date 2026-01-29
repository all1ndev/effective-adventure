import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import LoadingBar, { type LoadingBarRef } from "react-top-loading-bar";

export function NavigationProgress() {
	const ref = useRef<LoadingBarRef>(null);
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		ref.current?.continuousStart();
		const timeout = setTimeout(() => ref.current?.complete(), 300);
		return () => clearTimeout(timeout);
	}, [pathname, searchParams]);

	return (
		<LoadingBar
			color="var(--muted-foreground)"
			ref={ref}
			shadow={true}
			height={2}
		/>
	);
}
