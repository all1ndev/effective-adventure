import React, { useState } from "react";
import useDialogState from "@/hooks/use-dialog-state";
import { type Task } from "../data/schema";

type SarciniDialogType = "create" | "update" | "delete" | "import";

type SarciniContextType = {
	open: SarciniDialogType | null;
	setOpen: (str: SarciniDialogType | null) => void;
	currentRow: Task | null;
	setCurrentRow: React.Dispatch<React.SetStateAction<Task | null>>;
};

const SarciniContext = React.createContext<SarciniContextType | null>(null);

export function SarciniProvider({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useDialogState<SarciniDialogType>(null);
	const [currentRow, setCurrentRow] = useState<Task | null>(null);

	return (
		<SarciniContext value={{ open, setOpen, currentRow, setCurrentRow }}>
			{children}
		</SarciniContext>
	);
}

 
export const useSarcini = () => {
	const sarciniContext = React.useContext(SarciniContext);

	if (!sarciniContext) {
		throw new Error("useSarcini has to be used within <SarciniContext>");
	}

	return sarciniContext;
};
