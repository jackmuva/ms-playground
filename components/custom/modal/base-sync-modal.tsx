import useParagon from "@/lib/paragon/useParagon";
import { LoadingSkeleton } from "./sync-modal";
import { CRM_CATEGORY, FILE_CATEGORY } from "@/lib/paragon/useParagon";

export const BaseSyncModal = ({
	session,
	selectIntegration,
}: {
	session: { user: any, paragonUserToken?: string },
	selectIntegration: (integration: any) => void,
}) => {
	const { user, paragon } = useParagon(
		session.paragonUserToken ?? ""
	);

	const integrations = paragon?.getIntegrationMetadata();

	return (<>
		{integrations === undefined ? (<LoadingSkeleton />) : (
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
									onClick={() => selectIntegration(integration)}
									key={integration.type}>
									<div className="flex space-x-2">
										<img src={integration.icon} className="h-6 w-6" />
										<div>{integration.name}</div>
									</div>
									<div className={`${enabled ? "bg-gray-400/70" : "bg-indigo-500/70"} px-2 text-sm font-semibold`}>
										<p>{enabled ? "configure" : "sync"}</p>
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
									onClick={() => selectIntegration(integration)}
									key={integration.type}>
									<div className="flex space-x-2">
										<img src={integration.icon} className="h-6 w-6" />
										<div>{integration.name}</div>
									</div>
									<div className={`${enabled ? "bg-gray-400/70" : "bg-indigo-500/70"} px-2 text-sm font-semibold`}>
										<p>{enabled ? "configure" : "sync"}</p>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</>
		)}
	</>
	);
}
