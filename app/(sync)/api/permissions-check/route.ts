import { getUser } from "@/db/queries";
import { NextRequest } from "next/server";
import { userWithToken } from "@/app/(auth)/auth";
import { getSyncTriggerByUserIdAndSource } from "@/db/queries";

export async function POST(request: NextRequest) {
	const body = await request.json();
	body.data = JSON.parse(body.object.data);

	const session = await userWithToken();
	if (!session || !session.user) {
		return Response.json("Unauthorized!", { status: 401 });
	}

	const user = await getUser(session.user.email);
	if (user.length === 0) {
		return Response.json("No user found", { status: 500 });
	}

	try {
		const syncTrigger = await getSyncTriggerByUserIdAndSource({ id: user[0].id, source: body.source });
		if (syncTrigger.length === 0) {
			return Response.json({
				message: `could not find trigger by this source: ${body.sync}`
			});
		}
		console.log(body);

		const request = await fetch(`${process.env.MANAGED_SYNC_URL}/permissions/${syncTrigger[0].syncId}/list-users`, {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${process.env.MANAGED_SYNC_JWT}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				object: `${body.data.id}`,
				role: body.role,
			}),
		});
		const response = await request.json();
		console.log(response);
		return Response.json({ data: response });
	} catch (error) {
		console.error("[PERMISSIONS CHECK] failed to check permissions", error);
		return Response.json({ message: error });
	}
}


