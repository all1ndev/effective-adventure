"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import {
	subscribeUser,
	unsubscribeUser,
} from "@/app/actions/push-notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function urlBase64ToUint8Array(base64String: string) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

const emptySubscribe = () => () => {};

function getIsSupported() {
	return "serviceWorker" in navigator && "PushManager" in window;
}

export function PushNotificationManager() {
	const isSupported = useSyncExternalStore(
		emptySubscribe,
		getIsSupported,
		() => false,
	);
	const [subscription, setSubscription] = useState<PushSubscription | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [permissionDenied, setPermissionDenied] = useState(false);

	useEffect(() => {
		if (isSupported) {
			if (Notification.permission === "denied") {
				setPermissionDenied(true);
			}

			navigator.serviceWorker
				.register("/sw.js", {
					scope: "/",
					updateViaCache: "none",
				})
				.then((registration) => registration.pushManager.getSubscription())
				.then((sub) => setSubscription(sub))
				.catch(() => {});
		}
	}, [isSupported]);

	async function subscribeToPush() {
		setError(null);
		setIsLoading(true);
		try {
			const permission = await Notification.requestPermission();
			if (permission !== "granted") {
				setPermissionDenied(true);
				return;
			}

			const registration = await navigator.serviceWorker.ready;
			const sub = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(
					process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
				),
			});
			setSubscription(sub);
			const serializedSub = JSON.parse(JSON.stringify(sub));
			await subscribeUser(serializedSub);
		} catch (err) {
			const msg = err instanceof Error ? err.message : JSON.stringify(err);
			setError(`Eroare: ${msg}`);
		} finally {
			setIsLoading(false);
		}
	}

	async function unsubscribeFromPush() {
		await subscription?.unsubscribe();
		setSubscription(null);
		await unsubscribeUser();
	}

	if (!isSupported || subscription) {
		return null;
	}

	return (
		<Card>
			<CardContent className="flex items-center justify-between gap-4 p-4">
				<div className="space-y-1">
					<h3 className="text-sm font-semibold">Notificări Push</h3>
					<p className="text-sm text-muted-foreground">
						{permissionDenied
							? "Notificările sunt blocate de browser."
							: "Nu ești abonat la notificări push."}
					</p>
					{permissionDenied && (
						<p className="text-sm text-muted-foreground">
							Permite notificările din setările browserului sau din setările
							aplicației dacă este instalată, apoi reîncarcă pagina.
						</p>
					)}
					{error && <p className="text-sm text-red-500">{error}</p>}
				</div>
				<Button
					size="sm"
					onClick={subscribeToPush}
					disabled={isLoading || permissionDenied}
				>
					{isLoading ? "Se procesează..." : "Abonare"}
				</Button>
			</CardContent>
		</Card>
	);
}
