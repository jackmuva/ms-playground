import { SyncTable } from "./sync-table";

export const HomePage = ({
	id,
	session
}: {
	id: string,
	session: { user: any, paragonUserToken?: string }
}) => {
	return (
		<div className="flex justify-center max-w-full h-dvh pt-12">
			<SyncTable session={session} />
		</div>
	);
}
