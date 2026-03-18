"use client";

import { useLayout } from "@/context/layout-provider";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
	useSidebar,
} from "@/components/ui/sidebar";
import { getSidebarData } from "./data/sidebar-data";
import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";
import { useSession } from "@/lib/auth-client";
import { getUserRole } from "@/lib/roles";
import { Stethoscope, User } from "lucide-react";

function SidebarHeaderContent({ role }: { role: string }) {
	const { state } = useSidebar();
	const collapsed = state === "collapsed";
	const isMedic = role === "admin";

	if (collapsed) {
		return (
			<div className="flex items-center justify-center py-2">
				{isMedic ? (
					<Stethoscope className="h-5 w-5 text-muted-foreground" />
				) : (
					<User className="h-5 w-5 text-muted-foreground" />
				)}
			</div>
		);
	}

	return (
		<div className="px-3 py-2">
			<p className="text-sm font-semibold">TransplantCare</p>
			<p className="text-xs text-muted-foreground capitalize">{role}</p>
		</div>
	);
}

export function AppSidebar() {
	const { collapsible, variant } = useLayout();
	const { data: session } = useSession();
	const role = getUserRole(session?.user?.role) ?? "user";
	const data = getSidebarData(role);

	const user = session?.user
		? {
				name: session.user.name,
				email: session.user.email,
				avatar: session.user.image ?? "",
			}
		: data.user;

	return (
		<Sidebar collapsible={collapsible} variant={variant}>
			<SidebarHeader>
				<SidebarHeaderContent role={role} />
			</SidebarHeader>
			<SidebarContent>
				{data.navGroups.map((props) => (
					<NavGroup key={props.title} {...props} />
				))}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
