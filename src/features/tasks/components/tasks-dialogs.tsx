import { showSubmittedData } from "@/lib/show-submitted-data";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { SarciniImportDialog } from "./tasks-import-dialog";
import { SarciniMutateDrawer } from "./tasks-mutate-drawer";
import { useSarcini } from "./tasks-provider";

export function SarciniDialogs() {
	const { open, setOpen, currentRow, setCurrentRow } = useSarcini();
	return (
		<>
			<SarciniMutateDrawer
				key="task-create"
				open={open === "create"}
				onOpenChange={() => setOpen("create")}
			/>

			<SarciniImportDialog
				key="tasks-import"
				open={open === "import"}
				onOpenChange={() => setOpen("import")}
			/>

			{currentRow && (
				<>
					<SarciniMutateDrawer
						key={`task-update-${currentRow.id}`}
						open={open === "update"}
						onOpenChange={() => {
							setOpen("update");
							setTimeout(() => {
								setCurrentRow(null);
							}, 500);
						}}
						currentRow={currentRow}
					/>

					<ConfirmDialog
						key="task-delete"
						destructive
						open={open === "delete"}
						onOpenChange={() => {
							setOpen("delete");
							setTimeout(() => {
								setCurrentRow(null);
							}, 500);
						}}
						handleConfirm={() => {
							setOpen(null);
							setTimeout(() => {
								setCurrentRow(null);
							}, 500);
							showSubmittedData(
								currentRow,
								"The following task has been deleted:",
							);
						}}
						className="max-w-md"
						title={`Delete this task: ${currentRow.id} ?`}
						desc={
							<>
								You are about to delete a task with the ID{" "}
								<strong>{currentRow.id}</strong>. <br />
								This action cannot be undone.
							</>
						}
						confirmText="Delete"
					/>
				</>
			)}
		</>
	);
}
