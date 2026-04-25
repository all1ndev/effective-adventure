import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { unsubscribeUser } from "@/app/actions/push-notifications";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface SignOutDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
	const router = useRouter();

	const handleSignOut = async () => {
		// Remove push subscription from DB before session is destroyed
		try {
			const registration = await navigator.serviceWorker?.getRegistration();
			const sub = await registration?.pushManager?.getSubscription();
			if (sub) await sub.unsubscribe();
			await unsubscribeUser();
		} catch {
			// Best-effort — don't block logout if push cleanup fails
		}
		await signOut();
		router.replace("/sign-in");
	};

	return (
		<ConfirmDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Deconectare"
			desc="Ești sigur că vrei să te deconectezi? Va trebui să te conectezi din nou pentru a accesa contul."
			confirmText="Deconectare"
			destructive
			handleConfirm={handleSignOut}
			className="sm:max-w-sm"
		/>
	);
}
