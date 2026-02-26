import { ContentSection } from "../components/content-section";
import { AccountForm } from "./account-form";

export function SettingsAccount() {
	return (
		<ContentSection
			title="Cont"
			desc="Actualizați setările contului. Setați limba și fusul orar preferat."
		>
			<AccountForm />
		</ContentSection>
	);
}
