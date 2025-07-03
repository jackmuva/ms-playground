"use client";
import useSWR from "swr";
import { SyncPipeline } from "@/db/schema";
import { fetcher } from "@/lib/utils";
import { useEffect, useState } from "react";
import { SyncSteps } from "./sync-steps";

export interface SyncStep {
	description: string,
	status: "completed" | "in-progress" | "not-started"
}

export const SyncStatusPanel = ({
	source,
	session
}: {
	source: string,
	session: { user: any, paragonUserToken?: string }
}) => {

	const { data: sync, isLoading, mutate } = useSWR<Array<SyncPipeline>>(session ? `/api/get-sync?source=${source}` : null,
		fetcher, { fallbackData: [] });
	useEffect(() => {
		if (sync && sync.length > 0 && sync[0].status === "INITIALIZING") {
			fetch(`${window.location.origin}/api/check-sync`, {
				method: "POST",
				body: JSON.stringify({ syncId: sync[0].syncId }),
				headers: {
					"Content-Type": "application/json",
				},

			}).then((status) => {
				console.log(status);
				mutate();
			}).catch((err) => {
				console.error('unable to check status', err);
			});
		}
	}, [sync]);
	const [steps, setSteps] = useState<Array<SyncStep>>([
		{ description: "Discovered files available", status: "completed" },
		{ description: "Normalized metadata for files", status: "not-started" },
		{ description: "Built permissions graph", status: "not-started" },
		{ description: "Setting up change detection", status: "not-started" },
	]);

	return (
		<div className="border-2 rounded-sm w-full h-60 flex">
			<div className="w-1/6 flex flex-col h-full pt-8 pl-4">
				<div className="text-sm font-semibold">Status</div>
			</div>
			<div className="w-2/6 flex flex-col h-full pt-8">
				<SyncSteps steps={steps} />
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
