"use client";
import { fetcher } from "@/lib/utils";
import { SyncPipeline } from "@/db/schema";
import useSWR from "swr";
import { Button } from "../ui/button";
import { useState } from "react";
import { SyncModal } from "./sync-modal/sync-modal";
import { ICONS } from "@/lib/paragon/useParagon";
export const LoadingTable = () => {
	return (<div className="flex flex-col max-w-[1200px] w-full">
		{[44, 32, 28, 52].map((item) => (
			<div key={item} className="p-2 my-[2px]">
				<div
					className={`w-${item} h-[20px] rounded-md bg-zinc-200 dark:bg-zinc-600 animate-pulse`}
				/>
			</div>
		))}
	</div>
	)
}

export const SyncTable = ({
	session
}: {
	session: { user: any, paragonUserToken?: string }
}) => {
	const { data: syncs, isLoading, } = useSWR<Array<SyncPipeline>>(session ? `/api/list-syncs` : null,
		fetcher, { fallbackData: [] });
	const [syncTableState, setSyncTableState] = useState<{ openModal: boolean, integration: any }>({ openModal: false, integration: {} });

	const toggleModal = (intg = {}) => {
		setSyncTableState((prev) => ({ openModal: !prev.openModal, integration: intg }));
	}



	return (
		<div className="w-11/12 pt-5 flex">
			<div className="w-full flex flex-col items-center">
				<div className="max-w-[1000px] w-full flex justify-between">
					<h1 className="font-semibold text-2xl mb-4">
						Syncs
					</h1>
					{syncs && syncs.length > 0 && <Button
						variant="outline"
						size="sm"
						className="bg-indigo-700 text-white"
						onClick={() => toggleModal()}
					>
						+ Add a sync
					</Button>}

				</div>
				{isLoading ? (<LoadingTable />) : (
					(syncs && syncs.length > 0) ? (
						<table className="max-w-[1000px] w-full table-fixed">
							<thead>
								<tr>
									<th className="p-2 font-semibold">Type</th>
									<th className="p-2 font-semibold">Status</th>
									<th className="p-2 font-semibold">Last Synced</th>
									<th className="p-2 font-semibold"></th>
								</tr>
							</thead>
							<tbody>
								{syncs?.map((sync) => {
									return (
										<tr key={sync.id} className="border-2 rounded-xl m-1 ">
											<td className="py-6 ">
												<a href={`${window.location.origin}/sync-detail/${sync.source}`}
													className="flex space-x-2 items-center justify-center hover:text-indigo-600">
													<img src={sync.source === 'googledrive' ? ICONS[sync.source] : ""}
														className="h-6 w-6" />
													<p className="hover:border-b"> {sync.source}</p>
												</a>
											</td>
											<td className="text-center">{sync.status === "IDLE" ? "Sync Complete" : (
												sync.status === "INITIALIZING" ? "Sync Started" : "Syncing"
											)}</td>
											<td className="text-center">{new Date(sync.lastSynced).toLocaleString()}</td>
											<td className="text-right pr-4">
												<Button
													variant="outline"
													size="sm"
													className=""
													onClick={() => toggleModal({ type: sync.source, name: "Google Drive", icon: ICONS[sync.source].toString() })}
												>
													Configure
												</Button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					) : (
						<div className="max-w-[1200px] w-full h-96 flex flex-col space-y-4 items-center justify-center border-2 rounded-sm">
							<p className="font-semibold"> Create your first sync:</p>
							<Button
								variant="outline"
								size="sm"
								className="bg-indigo-700 text-white"
								onClick={() => toggleModal()}
							>
								+ Add a sync
							</Button>
							<p className="text-sm text-gray-500 text-center">
								You can select what access your Sync has over your account for testing.
								<br />
								Only metadata for records are stored and will be completely removed after 24 hours.
							</p>
						</div>
					)
				)}
			</div>
			{syncTableState.openModal && <SyncModal session={session} closeModal={toggleModal} integration={syncTableState.integration} />}
		</div >
	);
}
