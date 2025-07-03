import { userWithToken } from "@/app/(auth)/auth";
import { getUser, upsertSyncPipeline } from "@/db/queries";
import { NextRequest } from "next/server";

interface SyncPayload {
	integration: string,
	pipeline: string,
	config?: any,
};

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
		const body: SyncPayload = await request.json();
		const syncRequest = await fetch(`${process.env.MANAGED_SYNC_URL}/sync`, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${process.env.MANAGED_SYNC_JWT}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				integration: body.integration,
				pipeline: body.pipeline,
				configuration: {},
			}),
		});
		const syncResponse = await syncRequest.json();

		upsertSyncPipeline({
			syncId: syncResponse.id,
			source: body.integration,
			lastSynced: new Date(),
			status: syncResponse.status,
			userId: user[0].id,
			data: JSON.stringify(syncResponse),
			config: JSON.stringify(body.config),
			recordCount: 0
		}).then((res) => {
			console.log(`[NEW SYNC] successfully created`, res);
		});
		return Response.json(syncResponse);
	} catch (error) {
		console.error("[NEW SYNC] failed to create");
		return Response.json({ message: error });
	}

}
