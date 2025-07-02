import { Button } from "@/components/ui/button";
import useParagon from "@/lib/paragon/useParagon";

export const FileModal = ({
	integration,
	session,
	goBack,
}: {
	integration: any,
	session: { user: any, paragonUserToken?: string },
	goBack: () => void;
}) => {
	const { user, paragon } = useParagon(
		session.paragonUserToken ?? ""
	);

	const disconnectIntegration = async (integration: string) => {
		await paragon?.uninstallIntegration(integration);
	}

	const connectIntegration = async (integration: string) => {
		await paragon?.installIntegration(integration);
	}

	const enabled = user?.integrations[integration.type]?.enabled!

	//TODO: listener for paragon integration installed

	return (
		<div className="flex flex-col space-y-2 items-center">
			<div className="w-full">
				<Button
					variant="link"
					size={"sm"}
					className="text-indigo-500"
					onClick={() => goBack()}>
					Back
				</Button>
			</div>
			<img src={integration.icon} className="h-10 w-10" />
			{!enabled ? (<>
				<h3 className="font-semibold">
					Connect your {integration.name} account
				</h3>
				<p className="text-center">
					Authorize access to your {integration.name} account to select specific directories to sync.
				</p>
				<p className="text-center text-gray-500 dark:text-gray-400">
					This uses the Paragon SDK to start the OAuth connection process.
				</p>
				<p className="text-center text-gray-500 dark:text-gray-400">
					In your app, you can present this dialog to onboard users into your Sync integration.
				</p>
				<Button
					variant="default"
					size={"sm"}
					className={`${enabled ? "bg-red-600" : "bg-indigo-700"} text-white`}
					onClick={() => { enabled ? disconnectIntegration(integration.type) : connectIntegration(integration.type) }}>
					{enabled ? "Disconnect" : "Connect"}
				</Button>
			</>) : (<>

			</>)}
		</div>
	)
}
