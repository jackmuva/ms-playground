"use client";
import { fetcher } from "@/lib/utils";
import { SyncPipeline } from "@/db/schema";
import useSWR from "swr";
import { Button } from "../ui/button";
import { useState } from "react";
import { SyncModal } from "./modal/sync-modal";
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
	const { data: syncs, isLoading, } = useSWR<Array<SyncPipeline>>(session ? `/api/syncs` : null,
		fetcher, { fallbackData: [] });
	const [openModal, setOpenModal] = useState<boolean>(false);

	const toggleModal = () => {
		setOpenModal((prev) => !prev);
	}


	return (
		<div className="w-11/12 pt-5 flex">
			<div className="w-full flex flex-col items-center">
				<div className="max-w-[1200px] w-full flex justify-between">
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
						<table className="max-w-[1200px] w-full table-fixed">
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
											<td className="text-center py-6">{sync.source}</td>
											<td className="text-center">{sync.status}</td>
											<td className="text-center">{new Date(sync.lastSynced).toLocaleString()}</td>
											<td></td>
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
			{openModal && <SyncModal session={session} closeModal={toggleModal} />}
		</div >
	);
}
