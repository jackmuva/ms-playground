import { NextRequest } from "next/server";
import { createActivity, createSyncedObject, getSyncTriggerByUserIdAndSource, getUser } from "@/db/queries";
import { SignJWT } from "jose";
import { importPrivateKey, userWithToken } from "@/app/(auth)/auth";
import { Activity } from "@/db/schema";

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

	//NOTE:For demo purposes, we'll be triggering this manually
	//In production, webhooks will be triggered with Managed Sync service
	//and we'll be able to remove this session and user logic
	const session = await userWithToken();
	if (!session || !session.user) {
		return Response.json("Unauthorized!", { status: 401 });
	}

	const user = await getUser(session.user.email);
	if (user.length === 0) {
		return Response.json("No user found", { status: 500 });
	} else {
		body.user.id = user[0].id;
		body.user.email = user[0].email;
	}
	//////////////////////////////////

	try {
		const response = await createActivity({
			event: body.event,
			source: body.sync,
			// TODO: Check that synced_at is the time of webhook OR time of initial sync
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
		const syncTrigger = await getSyncTriggerByUserIdAndSource({ id: body.user.id, source: body.sync });
		if (syncTrigger.length === 0) {
			return Response.json({
				message: `could not find trigger by this source: ${body.sync}`
			});
		}

		const upsertResponse = await upsertSyncedObjects(body.user.id, syncTrigger[0].syncId ?? "", body.sync);
		sendSyncToWorker(body.user.id, syncTrigger[0]);
		setTimeout(() => {
			console.log('returning');
		}, 5000);
		return Response.json({ metadata: upsertResponse });
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
			await createSyncedObject({
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
		// WARNING: token in header may expire, may be worth having a refresh token method
		let newErroredRecords = await upsertSyncedObjects(user, syncId, integration, recordResponse.paging.cursor);
		erroredRecords = erroredRecords.concat(newErroredRecords);
	}
	return erroredRecords;
}


const sendSyncToWorker = async (userId: string, syncTrigger: Activity) => {
	// HACK: for multiple syncs, a better way to get sync id may be 
	// to use the synced_at field if it refers to the initial sync
	const jwt = await signJwt(userId);
	if (!process.env.SYNC_BACKGROUND_WORKER_URL) {
		console.error("[WEBHOOK] set SYNC_BACKGROUND_WORKER_URL");
		return Response.json({
			message: `no sync background worker`
		});
	}
	const workerRequest = await fetch(process.env.SYNC_BACKGROUND_WORKER_URL, {
		method: "POST",
		headers: { Authorization: `Bearer ${jwt}` },
		body: JSON.stringify(syncTrigger),
	});
	const workerResponse = await workerRequest.json();
	return workerResponse
}

const signJwt = async (userId: string): Promise<string> => {
	const PRIVATE_KEY = await importPrivateKey(process.env.PARAGON_SIGNING_KEY!);
	const paragonUserToken = await new SignJWT({
		sub: userId,
	})
		.setProtectedHeader({ alg: "RS256" })
		.setIssuedAt()
		.setExpirationTime("60m")
		.sign(PRIVATE_KEY);
	return paragonUserToken;

}
