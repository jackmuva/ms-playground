import { NextRequest } from "next/server";
import { createRecord, createWebhook, getSyncBySource } from "@/db/queries";

interface SyncWebhook {
	event: string,
	sync: string,
	user: {
		id: string,
		email?: string
	},
	data: {
		model: string,
		synced_at: string,
		num_records: number
	},
}

export async function POST(request: NextRequest) {
	const body: SyncWebhook = await request.json();
	try {
		const response = await createWebhook({
			event: body.event,
			source: body.sync,
			receivedAt: new Date(body.data.synced_at),
			data: JSON.stringify(body.data),
			userId: body.user.id
		});
		console.log(`[WEBHOOK] successfully logged activity ${response}`);
	} catch (error) {
		console.error("[WEBHOOK] failed to create activity");
		throw error;
	}

	try {
		const syncTrigger = await getSyncBySource({ userId: body.user.id, source: body.sync });
		if (syncTrigger.length === 0) {
			return Response.json({
				message: `could not find trigger by this source: ${body.sync}`
			});
		}

		await upsertSyncedObjects(body.user.id, syncTrigger[0].syncId ?? "", body.sync);
		return Response.json({ status: 200 });
	} catch (error) {
		console.error("[WEBHOOK] failed to send to worker");
		throw error;
	}
}


const upsertSyncedObjects = async (user: string, syncId: string, integration: string, cursor?: string): Promise<Array<string>> => {
	let erroredRecords: Array<string> = []

	const recordRequest = await fetch(process.env.MANAGED_SYNC_URL + `/sync/${syncId}/records?pageSize=100&${cursor ? `cursor=${cursor}` : ""}`, {
		method: "GET",
		headers: { "Authorization": `Bearer ${process.env.MANAGED_SYNC_JWT}` },
	});
	const recordResponse = await recordRequest.json();
	for (const data of recordResponse.data) {
		try {
			await createRecord({
				syncObjectId: data.id,
				externalId: data.external_id,
				createdAt: new Date(data.created_at),
				updatedAt: new Date(data.updated_at),
				userId: user,
				source: integration,
				data: JSON.stringify({ ...data }),
			});
		} catch (error) {
			erroredRecords.push(data.id);
		}
	}
	if (recordResponse.paging.remaining_records > 0) {
		let newErroredRecords = await upsertSyncedObjects(user, syncId, integration, recordResponse.paging.cursor);
		erroredRecords = erroredRecords.concat(newErroredRecords);
	}
	return erroredRecords;
}

