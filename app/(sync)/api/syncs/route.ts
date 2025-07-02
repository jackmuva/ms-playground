import { userWithToken } from "@/app/(auth)/auth";
import { getAllSyncs, getUser } from "@/db/queries";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const session = await userWithToken();

	if (!session || !session.user) {
		return Response.json("Unauthorized!", { status: 401 });
	}

	const user = await getUser(session.user.email);
	if (user.length === 0) {
		return Response.json("No user found", { status: 500 });
	}

	try {
		const syncs = await getAllSyncs({ userId: user[0].id });
		console.log(`[SYNCS] successfully retrieved`);
		return Response.json(syncs);
	} catch (error) {
		console.error("[SYNCS] failed to retrieve");
		return Response.json({ message: error });
	}

}
