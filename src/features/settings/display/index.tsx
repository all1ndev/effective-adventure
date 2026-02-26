import { ContentSection } from "../components/content-section";
import { DisplayForm } from "./display-form";

export function SettingsDisplay() {
	return (
		<ContentSection
			title="Afișaj"
			desc="Activați sau dezactivați elementele pentru a controla ce se afișează."
		>
			<DisplayForm />
		</ContentSection>
	);
}
