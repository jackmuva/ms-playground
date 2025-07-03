import { userWithToken } from "@/app/(auth)/auth";
import { getUser, updateSyncStatus, upsertSyncPipeline } from "@/db/queries";
import { NextRequest } from "next/server";

interface CheckSyncPayload {
	syncId: string,
};

interface SyncStatus {
	status: string,
	summary: {
		totalRecords: number,
		syncedRecordsCount: number,
		lastSyncedAt: string,
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
		updateSyncStatus({
			syncId: body.syncId,
			data: JSON.stringify(syncResponse),
			recordCount: syncResponse.summary.syncedRecordsCount,
			status: syncResponse.status,
			lastSynced: new Date(syncResponse.summary.lastSyncedAt),
		}).then((res) => {
			console.log(`[CHECK SYNC] successfully created`, res);
		});
		return Response.json(syncResponse);
	} catch (error) {
		console.error("[CHECK SYNC] failed to create");
		return Response.json({ message: error });
	}

}
