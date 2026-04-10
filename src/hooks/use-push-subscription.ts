"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import {
	subscribeUser,
	unsubscribeUser,
} from "@/app/actions/push-notifications";

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

export function usePushSubscription() {
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
				.register("/sw.js", { scope: "/", updateViaCache: "none" })
				.then((registration) => registration.pushManager.getSubscription())
				.then((sub) => {
					setSubscription(sub);
					// Ensure the current user owns this browser subscription
					// (no-op if already saved for this user)
					if (sub) {
						const serialized = JSON.parse(JSON.stringify(sub));
						subscribeUser(serialized).catch(() => {});
					}
				})
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
				return false;
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
			return true;
		} catch (err) {
			const msg = err instanceof Error ? err.message : JSON.stringify(err);
			setError(`Eroare: ${msg}`);
			return false;
		} finally {
			setIsLoading(false);
		}
	}

	async function unsubscribeFromPush() {
		await subscription?.unsubscribe();
		setSubscription(null);
		await unsubscribeUser();
	}

	return {
		subscription,
		isSupported,
		permissionDenied,
		isLoading,
		error,
		subscribeToPush,
		unsubscribeFromPush,
	};
}
