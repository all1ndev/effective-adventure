"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { phoneNumber, signOut, useSession } from "@/lib/auth-client";
import { useState } from "react";

export default function Page() {
	const session = useSession();
	const [phone, setPhone] = useState("");

	function sendOtp(event: React.FormEvent) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		const phone = formData.get("phone") as string;

		setPhone(phone);

		phoneNumber.sendOtp({
			phoneNumber: phone,
		});
	}

	function onVerify(event: React.FormEvent) {
		event.preventDefault();

		if (!phone) return;

		const formData = new FormData(event.target as HTMLFormElement);
		const otp = formData.get("otp") as string;

		phoneNumber.verify({ phoneNumber: phone, code: otp });
	}

	return (
		<main>
			{session.data?.session ? (
				<div>
					<Button type="button" onClick={() => signOut()}>
						Logout
					</Button>
					<pre>
						<code>{JSON.stringify(session.data?.user ?? {}, null, "\t")}</code>
					</pre>
				</div>
			) : (
				<div>
					<form className="flex" onSubmit={sendOtp}>
						<Input type="text" name="phone" placeholder="Phone Number" />
						<Button type="submit">Send</Button>
					</form>
					<form className="flex" onSubmit={onVerify}>
						<Input type="text" name="otp" placeholder="Confirmation Code" />
						<Button type="submit">Verify</Button>
					</form>
				</div>
			)}
		</main>
	);
}
