"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import {
	subscribeUser,
	unsubscribeUser,
	sendNotification,
} from "@/app/actions/push-notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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
	const [message, setMessage] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isSupported) {
			navigator.serviceWorker
				.register("/sw.js", {
					scope: "/",
					updateViaCache: "none",
				})
				.then((registration) => registration.pushManager.getSubscription())
				.then((sub) => setSubscription(sub))
				.catch((err) => console.error("SW registration failed:", err));
		}
	}, [isSupported]);

	async function subscribeToPush() {
		setError(null);
		setIsLoading(true);
		try {
			const permission = await Notification.requestPermission();
			if (permission !== "granted") {
				setError(
					"Permisiunea pentru notificări a fost refuzată. Activează notificările din setările browserului.",
				);
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
			console.error("Subscribe failed:", err);
			setError("Abonarea a eșuat. Încearcă din nou.");
		} finally {
			setIsLoading(false);
		}
	}

	async function unsubscribeFromPush() {
		await subscription?.unsubscribe();
		setSubscription(null);
		await unsubscribeUser();
	}

	async function sendTestNotification() {
		if (subscription) {
			await sendNotification(message);
			setMessage("");
		}
	}

	if (!isSupported) {
		return <p>Notificările push nu sunt suportate în acest browser.</p>;
	}

	return (
		<Card>
			<CardContent className="space-y-3 p-4">
				<div className="flex items-center justify-between gap-4">
					<div className="space-y-1">
						<h3 className="text-sm font-semibold">Notificări Push</h3>
						<p className="text-sm text-muted-foreground">
							{subscription
								? "Ești abonat la notificări push."
								: "Nu ești abonat la notificări push."}
						</p>
					</div>
					{subscription ? (
						<Button size="sm" variant="outline" onClick={unsubscribeFromPush}>
							Dezabonare
						</Button>
					) : (
						<Button size="sm" onClick={subscribeToPush} disabled={isLoading}>
							{isLoading ? "Se procesează..." : "Abonare"}
						</Button>
					)}
				</div>
				{error && <p className="text-sm text-red-500">{error}</p>}
				{subscription && (
					<div className="flex gap-2">
						<Input
							type="text"
							placeholder="Introdu mesajul notificării"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
						/>
						<Button size="sm" onClick={sendTestNotification}>
							Trimite Test
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
