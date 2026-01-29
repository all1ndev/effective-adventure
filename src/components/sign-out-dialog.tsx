import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface SignOutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { auth } = useAuthStore();

	const handleSignOut = () => {
		auth.reset();
		// Preserve current location for redirect after sign-in
		const query = searchParams.toString();
		const currentPath = `${pathname}${query ? `?${query}` : ""}`;
		const redirectParams = new URLSearchParams({ redirect: currentPath });
		router.replace(`/sign-in?${redirectParams.toString()}`);
	};

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Sign out"
			desc="Are you sure you want to sign out? You will need to sign in again to access your account."
			confirmText="Sign out"
			destructive
			handleConfirm={handleSignOut}
			className="sm:max-w-sm"
		/>
	);
}
