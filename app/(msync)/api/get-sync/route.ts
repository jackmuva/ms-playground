import { userWithToken } from "@/app/(auth)/auth";
import { getAllSyncs, getSyncBySource, getUser } from "@/db/queries";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const session = await userWithToken();
	const source = request.nextUrl.searchParams.get("source");

	if (!session || !session.user) {
		return Response.json("Unauthorized!", { status: 401 });
	}

	const user = await getUser(session.user.email);
	if (user.length === 0) {
		return Response.json("No user found", { status: 500 });
	}

	try {
		const sync = await getSyncBySource({ userId: user[0].id, source: source ?? "" });
		console.log(`[LIST SYNC] successfully retrieved`);
		return Response.json(sync);
	} catch (error) {
		console.error("[LIST SYNC] failed to retrieve");
		return Response.json({ message: error });
	}

}
