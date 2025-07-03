import { Button } from "@/components/ui/button";
import useParagon from "@/lib/paragon/useParagon";
import { useEffect, useState } from "react";
import { fetcher } from "@/lib/utils";
import { SyncPipeline } from "@/db/schema";
import useSWR from "swr";

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

	const [folder, setFolder] = useState<any>({});
	const { data: sync, isLoading, } = useSWR<Array<SyncPipeline>>(session ? `/api/get-sync?source=${integration.type}` : null,
		fetcher, { fallbackData: [] });
	useEffect(() => {
		if (sync && sync.length > 0) {
			setFolder({ name: JSON.parse(sync[0].config).folder });
		}
	}, [isLoading]);

	const disconnectIntegration = async (integration: string) => {
		await paragon?.uninstallIntegration(integration, {});
	}

	const connectIntegration = async (integration: string) => {
		await paragon?.installIntegration(integration, {});
	}

	//@ts-ignore
	const enabled = user?.integrations[integration.type]?.enabled!

	const openFilePicker = async () => {
		let picker = new paragon.ExternalFilePicker(integration.type, {
			allowedTypes: ["application/vnd.google-apps.folder"],
			allowMultiSelect: false,
			allowFolderSelect: true,
			onFileSelect: async (files: any) => {
				const req = await fetch(`${window.location.origin}/api/new-sync`, {
					method: "POST",
					body: JSON.stringify({
						integration: integration.type,
						pipeline: "files",
						config: { folder: files.docs[0].name },
					}),
				});
				const res = await req.json();
				console.log(res);
				setFolder(files.docs[0]);
			}
		});
		if (process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
			await picker.init({ developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY });
			picker.open();
		}
	}

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
				<div className="flex flex-col w-full">
					<div className="flex space-x-2 w-full items-center">
						<div className="rounded-full h-[15px] w-[15px] bg-green-500" />
						<p>Google Drive account connected</p>
					</div>
					<div className="border-l border-muted-foreground h-2 ml-[6.5px]" />
					<div className="flex space-x-2 w-full items-center">
						<div className={`rounded-full h-[15px] w-[15px] ${Object.keys(folder).length === 0 ? "border border-muted-foreground" : "bg-green-500"}`} />
						<p>Select a Google Drive folder</p>
					</div>
				</div>
				{Object.keys(folder).length === 0 ? (<Button
					variant="default"
					size={"sm"}
					className={"bg-indigo-700 text-white"}
					onClick={() => openFilePicker()}>
					Select folder
				</Button>) : (<div className="flex flex-col space-y-16 w-full">
					<div className="flex items-center justify-center space-x-2">
						<div className="px-2 py-1 border-2 border-indigo-700">
							{isLoading ? (
								<div className="p-2 my-[2px]">
									<div
										className={`w-4 h-[20px] rounded-md bg-zinc-200 dark:bg-zinc-600 animate-pulse`}
									/>
								</div>
							) : (<p>/{folder.name}</p>)}
						</div>
						<Button
							variant="default"
							size={"sm"}
							className={"bg-indigo-700 text-white"}
							onClick={() => openFilePicker()}>
							Update
						</Button>
					</div>
					<a href={`${window.location.origin}/sync-detail/${integration.type}`}
						className="absolute bottom-4 w-11/12 bg-indigo-700 text-white rounded-sm text-center font-semibold py-2
							hover:bg-primary/90">
						Go to Sync Details
					</a>
				</div>)}
			</>)
			}
		</div >
	)
}
