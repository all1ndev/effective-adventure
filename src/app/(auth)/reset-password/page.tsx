"use client";

import { useSearchParams } from "next/navigation";
import { redirect } from "next/navigation";
import { ResetPassword } from "@/features/auth/reset-password";

export default function ResetPasswordPage() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	if (!token) {
		redirect("/forgot-password");
	}

	return <ResetPassword token={token} />;
}
