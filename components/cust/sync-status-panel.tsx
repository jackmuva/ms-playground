"use client";
import useSWR from "swr";
import { SyncPipeline } from "@/db/schema";
import { fetcher } from "@/lib/utils";

export const SyncStatusPanel = ({
	source,
	session
}: {
	source: string,
	session: { user: any, paragonUserToken?: string }
}) => {

	const { data: sync, isLoading, } = useSWR<Array<SyncPipeline>>(session ? `/api/get-sync?source=${source}` : null,
		fetcher, { fallbackData: [] });
	console.log(sync);

	return (
		<div className="border-2 rounded-sm w-full h-60 flex">
			<div className="w-1/6 flex flex-col h-full pt-8 pl-4">
				<div className="text-sm font-semibold">Status</div>
			</div>
			<div className="w-2/6 flex flex-col h-full pt-8">
				<div className="flex items-center space-x-2">
					<div className="rounded-full h-[15px] w-[15px] bg-green-500" />
					<p className="text-sm text-muted-foreground">Discovered {sync[0].recordCount} files available</p>
				</div>
				<div className="border-l border-muted-foreground h-4 ml-[6.5px]" />
				<div className="flex items-center space-x-2">
					<div className="rounded-full h-[15px] w-[15px] bg-green-500" />
					<p className="text-sm text-muted-foreground">Normalized metadata for files</p>
				</div>
				<div className="border-l border-muted-foreground h-4 ml-[6.5px]" />
				<div className="flex items-center space-x-2">
					<div className="rounded-full h-[15px] w-[15px] bg-green-500" />
					<p className="text-sm text-muted-foreground">Built permissions graph</p>
				</div>
				<div className="border-l border-muted-foreground h-4 ml-[6.5px]" />
				<div className="flex items-center space-x-2">
					<div className="rounded-full h-[15px] w-[15px] bg-green-500 animate-pulse" />
					<p className="text-sm text-muted-foreground">Setting up change detection</p>
				</div>
			</div>
			<div className="w-3/6 flex">
				<div className="w-1/3 flex flex-col h-full justify-evenly">
					<div className="text-sm font-semibold">Last Synced</div>
					<div className="text-sm font-semibold">Folder</div>
					<div className="text-sm font-semibold">File Count</div>
					<div className="text-sm font-semibold">Sync ID </div>
				</div>
				<div className="w-2/3 flex flex-col h-full justify-evenly">
					{(sync !== undefined && sync.length > 0) && <>
						<div className="text-sm text-muted-foreground">{new Date(sync[0].lastSynced).toLocaleString()}</div>
						<div className="text-sm text-muted-foreground">{JSON.parse(sync[0].config).folder}</div>
						<div className="text-sm text-muted-foreground">{sync[0].recordCount ?? 0}</div>
						<div className="text-sm text-muted-foreground">{sync[0].syncId}</div>
					</>}
				</div>
			</div>
		</div>
	);
}
