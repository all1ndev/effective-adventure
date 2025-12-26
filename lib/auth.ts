import { betterAuth } from "better-auth";
import { phoneNumber } from "better-auth/plugins";
import Database from "better-sqlite3";

export const auth = betterAuth({
	database: new Database("./sqlite.db"),

	plugins: [
		phoneNumber({
			sendOTP: ({ phoneNumber, code }, ctx) => {
				console.log({ phoneNumber, code });
			},
			signUpOnVerification: {
				getTempEmail: (phoneNumber) => {
					return `${phoneNumber}@example.org`;
				},
			},
		}),
	],
});
