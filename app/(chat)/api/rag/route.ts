import { Message, DataStreamWriter, createDataStreamResponse, convertToCoreMessages, streamText } from "ai";
import { auth, userWithToken } from "@/app/(auth)/auth";
import { deleteChatById, getChatById, getUser, saveChat } from "@/db/queries";
import { customModel, invokeRagMessages } from "@/ai";

export async function POST(request: Request) {
	const { id,
		messages,
		impersonatedEmail,
	}: {
		id: string,
		messages: Array<Message>,
		impersonatedEmail: string
	} = await request.json();

	const session = await userWithToken();

	if (!session) {
		return new Response("Unauthorized", { status: 401 });
	}
	const user = await getUser(session.user?.email ?? "");
	const impersonatedUser = await getUser(impersonatedEmail ?? "");

	let ragContext: { sources: Array<string>, message: Message } = { sources: [], message: { id: 'x', content: "", role: "assistant" } };
	for (let i = messages.length - 1; i >= 0; i--) {
		if (messages[i].role === 'user') {
			ragContext = await invokeRagMessages(messages[i].content, user[0].id, impersonatedUser.length > 0 ? impersonatedUser[0].id : "");
			break;
		}
	}
	messages.push(ragContext.message);
	const coreMessages = convertToCoreMessages(messages);
	return createDataStreamResponse({
		execute(dataStream: DataStreamWriter) {
			const result = streamText({
				model: customModel({}),
				messages: coreMessages,
				onFinish: async ({ response: { messages: responseMessages } }) => {
					if (session.user && session.user.id) {
						try {
							await saveChat({
								id,
								messages: [...coreMessages, ...responseMessages],
								email: session.user.email,
								systemPrompt: "",
								tools: [],
								modelName: "none",
								modelProvider: "none",
							});
						} catch (error) {
							console.error("Failed to save chat", error);
						}
					}
				},
				experimental_telemetry: {
					isEnabled: true,
					functionId: "stream-text",
				},
			});
			result.mergeIntoDataStream(dataStream);
		},
		onError(error) {
			console.error(error);
			return "[RAG] An error occurred.";
		},
	});
}

export async function DELETE(request: Request) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get("id");

	if (!id) {
		return new Response("Not Found", { status: 404 });
	}

	const session = await auth();

	if (!session || !session.user) {
		return new Response("Unauthorized", { status: 401 });
	}

	try {
		const chat = await getChatById({ id });

		if (chat.userId !== session.user.id) {
			return new Response("Unauthorized", { status: 401 });
		}

		await deleteChatById({ id });

		return new Response("Chat deleted", { status: 200 });
	} catch (error) {
		return new Response("An error occurred while processing your request", {
			status: 500,
		});
	}
}
