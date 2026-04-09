"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import {
	subscribeUser,
	unsubscribeUser,
	sendNotification,
} from "@/app/actions/push-notifications";
import { Button } from "@/components/ui/button";
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

	useEffect(() => {
		if (isSupported) {
			navigator.serviceWorker
				.register("/sw.js", {
					scope: "/",
					updateViaCache: "none",
				})
				.then((registration) => registration.pushManager.getSubscription())
				.then((sub) => setSubscription(sub));
		}
	}, [isSupported]);

	async function subscribeToPush() {
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
		<div>
			<h3 className="text-lg font-semibold">Notificări Push</h3>
			{subscription ? (
				<>
					<p>Ești abonat la notificări push.</p>
					<Button onClick={unsubscribeFromPush} variant="outline">
						Dezabonare
					</Button>
					<div className="mt-2 flex gap-2">
						<Input
							type="text"
							placeholder="Introdu mesajul notificării"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
						/>
						<Button onClick={sendTestNotification}>Trimite Test</Button>
					</div>
				</>
			) : (
				<>
					<p>Nu ești abonat la notificări push.</p>
					<Button onClick={subscribeToPush}>Abonare</Button>
				</>
			)}
		</div>
	);
}
