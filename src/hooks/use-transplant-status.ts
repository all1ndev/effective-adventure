"use client";

import { useEffect, useState } from "react";
import { getCurrentPatientTransplantStatus } from "@/features/patient-dashboard/transplant-status";

interface TransplantStatus {
	isPreTransplant: boolean;
	transplantDate: string | null;
	isLoading: boolean;
}

const DISABLED_STATE: TransplantStatus = {
	isPreTransplant: false,
	transplantDate: null,
	isLoading: false,
};

export function useTransplantStatus(enabled: boolean): TransplantStatus {
	const [state, setState] = useState<TransplantStatus>(() => ({
		isPreTransplant: false,
		transplantDate: null,
		isLoading: enabled,
	}));

	useEffect(() => {
		if (!enabled) return;
		let cancelled = false;
		getCurrentPatientTransplantStatus()
			.then((res) => {
				if (cancelled) return;
				setState({
					isPreTransplant: res.isPreTransplant,
					transplantDate: res.transplantDate,
					isLoading: false,
				});
			})
			.catch(() => {
				if (cancelled) return;
				setState({
					isPreTransplant: false,
					transplantDate: null,
					isLoading: false,
				});
			});
		return () => {
			cancelled = true;
		};
	}, [enabled]);

	return enabled ? state : DISABLED_STATE;
}
