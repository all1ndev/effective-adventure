import { phoneNumberClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
	plugins: [phoneNumberClient()],
});

export const { signIn, signUp, useSession, phoneNumber, signOut } = authClient;
