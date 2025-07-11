import { userWithToken } from "@/app/(auth)/auth";
import { SyncStatusPanel } from "@/components/custom/sync-status-panel";
import { SyncTabContent } from "@/components/custom/sync-tab-content";



export default async function SyncDetailPage({
  params,
}: {
  params: Promise<{ source: string }>
}) {
  const { source } = await params;
  const session = await userWithToken();

  return (
    <div className="flex justify-center max-w-full h-fit pt-12">
      <div className="max-w-[1000px] w-11/12 flex flex-col space-y-4">
        <h1 className="pt-5 font-semibold text-2xl">{source === "googledrive" ? "Google Drive" : ""} Sync</h1>
        <SyncStatusPanel source={source} session={session} />
        <SyncTabContent source={source} session={session} />
      </div>
    </div>
  );
}
