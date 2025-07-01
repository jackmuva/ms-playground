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
		<div className="w-11/12 pt-5">
			<h1 className="font-semibold text-2xl">
				Syncs
			</h1>
		</div>
	);
}
