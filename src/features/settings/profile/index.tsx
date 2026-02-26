import { ContentSection } from "../components/content-section";
import { ProfileForm } from "./profile-form";

export function SettingsProfile() {
	return (
		<ContentSection title="Profil" desc="Așa te vor vedea ceilalți pe site.">
			<ProfileForm />
		</ContentSection>
	);
}
