import useParagon, { FILE_CATEGORY } from "@/lib/paragon/useParagon";
import { X } from "lucide-react"
import { useEffect, useState } from "react";
import { BaseSyncModal } from "./base-sync-modal";
import { FileModal } from "./file-modal";

export const LoadingSkeleton = () => {
	return Array(5)
		.fill(null)
		.map((_, i) => (
			<div
				className={`w-full mb-2 mr-2 rounded-lg cursor-pointer animate-pulse`}
				key={i}
			>
				<div className="border border-slate-300 dark:border-slate-700 rounded p-4">
					<div className="flex items-center mb-1">
						<div className="inline w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-500 mr-2" />
						<div className="inline rounded-full w-48 h-2 bg-slate-200 dark:bg-slate-500" />
					</div>
				</div>
			</div>
		));
};

export const SyncModal = ({
	session,
	closeModal,
	integration,
}: {
	session: { user: any, paragonUserToken?: string },
	closeModal: () => void,
	integration?: any,
}) => {
	const [selectedIntegration, setSelectedIntegration] = useState<any>({});

	useEffect(() => {
		if (Object.keys(integration).length > 0) {
			setSelectedIntegration(integration);
		}
	}, [integration]);

	const selectIntegration = (integration: any) => {
		setSelectedIntegration(integration);
	}

	return (
		<div className="fixed z-50 inset-0 flex justify-center items-center bg-black/80 w-dvw h-dvh" onClick={() => closeModal()}>
			<div className="py-2 px-4 flex flex-col space-y-2 relative bg-muted rounded-sm max-w-96 max-h-[400px] w-full h-full overflow-y-scroll" onClick={(e) => e.stopPropagation()}>
				<div className="flex w-full justify-between items-center">
					<h1 className="text-lg font-semibold">Choose a Sync</h1>
					<div className="rounded-sm opacity-70 ring-offset-background hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
						<X className="h-4 w-4 cursor-pointer" onClick={(e) => {
							e.stopPropagation();
							closeModal();
						}} />
					</div>
				</div>
				<div className="flex flex-col space-y-2 h-full">
					{Object.keys(selectedIntegration).length === 0 ? (<BaseSyncModal session={session} selectIntegration={selectIntegration} />) : (
						FILE_CATEGORY.includes(selectedIntegration.type) ? (
							<FileModal integration={selectedIntegration} session={session} goBack={() => selectIntegration({})} />
						) : (<> </>)
					)}
				</div>
			</div>
		</div >
	)
}
