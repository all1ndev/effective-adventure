import { ContentSection } from "../components/content-section";
import { NotificationsForm } from "./notifications-form";

export function SettingsNotifications() {
	return (
		<ContentSection
			title="Notificări"
			desc="Configurați modul în care primiți notificările."
		>
			<NotificationsForm />
		</ContentSection>
	);
}
