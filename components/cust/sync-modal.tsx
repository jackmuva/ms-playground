import useParagon, { CRM_CATEGORY, FILE_CATEGORY } from "@/lib/paragon/useParagon";
import { X } from "lucide-react"

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
}: {
	session: { user: any, paragonUserToken?: string },
	closeModal: () => void,
}) => {
	const { user, paragon } = useParagon(
		session.paragonUserToken ?? ""
	);
	const integrations = paragon?.getIntegrationMetadata();

	const connectIntegration = async (integration: string) => {
		await paragon?.installIntegration(integration);
	}
	const disconnectIntegration = async (integration: string) => {
		await paragon?.uninstallIntegration(integration);
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
					{integrations === undefined ? (
						<LoadingSkeleton />) : (
						<>
							<div className="basis-1/2 flex flex-col">
								<h2 className="font-semibold">Files</h2>
								<div className="border border-foreground overflow-y-scroll flex-1 p-1 rounded-sm">
									{integrations?.filter((integration) => {
										return FILE_CATEGORY.includes(integration.type);
									}).map((integration) => {
										const enabled = user?.integrations[integration.type]?.enabled!
										return (
											<div className="flex space-x-2 justify-between items-center p-2 cursor-pointer hover:bg-muted-foreground/70 rounded-sm"
												onClick={() => { enabled ? disconnectIntegration(integration.type) : connectIntegration(integration.type) }}
												key={integration.type}>
												<div className="flex space-x-2">
													<img src={integration.icon} className="h-6 w-6" />
													<div>{integration.name}</div>
												</div>
												<div className={`${enabled ? "bg-green-600/70" : "bg-indigo-500/70"} px-2 rounded-sm text-sm font-semibold`}>
													<p>{enabled ? "go to sync" : "sync"}</p>
												</div>
											</div>
										);
									})}
								</div>
							</div>
							<div className="basis-1/2 flex flex-col">
								<h2 className="font-semibold">CRM</h2>
								<div className="border border-foreground overflow-y-scroll flex-1 mb-2 rounded-sm">
									{integrations?.filter((integration) => {
										return CRM_CATEGORY.includes(integration.type);
									}).map((integration) => {
										const enabled = user?.integrations[integration.type]?.enabled!
										return (
											<div className="flex space-x-2 justify-between items-center p-2 cursor-pointer hover:bg-muted-foreground/70 rounded-sm"
												onClick={() => { enabled ? disconnectIntegration(integration.type) : connectIntegration(integration.type) }}
												key={integration.type}>
												<div className="flex space-x-2">
													<img src={integration.icon} className="h-6 w-6" />
													<div>{integration.name}</div>
												</div>
												<div className={`${enabled ? "bg-green-600/70" : "bg-indigo-500/70"} px-2 rounded-sm text-sm font-semibold`}>
													<p>{enabled ? "go to sync" : "sync"}</p>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div >
	)
}
