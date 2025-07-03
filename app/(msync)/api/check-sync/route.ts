import { userWithToken } from "@/app/(auth)/auth";
import { getUser, updateSyncStatus, upsertSyncPipeline } from "@/db/queries";
import { NextRequest } from "next/server";

interface CheckSyncPayload {
	syncId: string,
};

interface SyncStatus {
	status: string,
	summary: {
		total_records: number,
		synced_records_count: number,
		last_synced_at: string,
	}
}



export async function POST(request: NextRequest) {
	const session = await userWithToken();

	if (!session || !session.user) {
		return Response.json("Unauthorized!", { status: 401 });
	}

	const user = await getUser(session.user.email);
	if (user.length === 0) {
		return Response.json("No user found", { status: 500 });
	}

	try {
		const body: CheckSyncPayload = await request.json();
		const syncRequest = await fetch(`${process.env.MANAGED_SYNC_URL}/sync/${body.syncId}`, {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${process.env.MANAGED_SYNC_JWT}`,
			},
		});
		const syncResponse: SyncStatus = await syncRequest.json();
		console.log(syncResponse);

		await updateSyncStatus({
			syncId: body.syncId,
			data: JSON.stringify(syncResponse),
			recordCount: syncResponse.summary.synced_records_count,
			status: syncResponse.status,
			lastSynced: new Date(syncResponse.summary.last_synced_at),
		});
		console.log(`[CHECK SYNC] successfully created`);
		return Response.json(syncResponse);
	} catch (error) {
		console.error("[CHECK SYNC] failed to create");
		return Response.json({ message: error });
	}

}
