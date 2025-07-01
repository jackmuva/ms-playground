import { userWithToken } from "@/app/(auth)/auth";
import { getSyncedObjectByUserIdAndSource, getUser } from "@/db/queries";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	const source = request.nextUrl.searchParams.get("source");
	const session = await userWithToken();

	if (!session || !session.user) {
		return Response.json("Unauthorized!", { status: 401 });
	}

	const user = await getUser(session.user.email);
	if (user.length === 0) {
		return Response.json("No user found", { status: 500 });
	}

	const records = await getSyncedObjectByUserIdAndSource({ id: user[0].id, source: source ?? "" });
	return Response.json(records);
}

