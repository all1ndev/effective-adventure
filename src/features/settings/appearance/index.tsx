import { ContentSection } from "../components/content-section";
import { AppearanceForm } from "./appearance-form";

export function SettingsAppearance() {
	return (
		<ContentSection
			title="Aspect"
			desc="Personalizați aspectul aplicației. Comutați automat între temele de zi și noapte."
		>
			<AppearanceForm />
		</ContentSection>
	);
}
