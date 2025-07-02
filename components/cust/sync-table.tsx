"use client";
import { fetcher } from "@/lib/utils";
import { Activity } from "@/db/schema";
import useSWR from "swr";

export const SyncTable = ({
	session
}: {
	session: { user: any, paragonUserToken?: string }
}) => {
	const { data: syncs, isLoading, } = useSWR<Array<Activity>>(session ? `/api/syncs` : null,
		fetcher, { fallbackData: [] });
	console.log(syncs);


	return (
		<div className="w-11/12 pt-5 flex flex-col items-center">
			<div>
				<h1 className="font-semibold text-2xl mb-4">
					Syncs
				</h1>
				{isLoading ? (
					<div className="flex flex-col">
						{[44, 32, 28, 52].map((item) => (
							<div key={item} className="p-2 my-[2px]">
								<div
									className={`w-${item} h-[20px] rounded-md bg-zinc-200 dark:bg-zinc-600 animate-pulse`}
								/>
							</div>
						))}
					</div>
				) : (
					syncs ? (
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
											<td className="text-center">placeholder</td>
											<td className="text-center">{new Date(sync.receivedAt).toLocaleString()}</td>
											<td></td>
										</tr>
									);
								})}
							</tbody>
						</table>
					) : (
						<>
						</>
					)
				)}
			</div>
		</div >
	);
}
