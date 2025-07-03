import { userWithToken } from "@/app/(auth)/auth";
import { getUser, updateSyncStatus, upsertSyncPipeline } from "@/db/queries";
import { NextRequest } from "next/server";

interface DownloadRecordPayload {
	syncId: string,
	recordId: string,
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
		const body: DownloadRecordPayload = await request.json();
		const contentRequest = await fetch(`${process.env.MANAGED_SYNC_URL}/syncs/${body.syncId}/records/${body.recordId}/content`, {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${process.env.MANAGED_SYNC_JWT}`,
			},
		});
		console.log(contentRequest);

		const buffer = await contentRequest.arrayBuffer();
		console.log(buffer);
		console.log(`[DOWNLOAD CONTENT] successfully downloaded`);

		return new Response(buffer, {
			status: 200,
			headers: {
				'Content-Type': 'application/octet-stream',
				'Content-Disposition': 'attachment; filename="download"',
			},
		});

	} catch (error) {
		console.error("[DOWNLOAD CONTENT] failed to download:", error);
		return Response.json({ message: "Download failed" }, { status: 500 });
	}
}
