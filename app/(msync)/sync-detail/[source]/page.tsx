import { userWithToken } from "@/app/(auth)/auth";
import { SyncDetail } from "@/components/custom/sync-detail";



export default async function SyncDetailPage({
  params,
}: {
  params: Promise<{ source: string }>
}) {
  const { source } = await params;
  const session = await userWithToken();

  return (
    <div className="flex justify-center max-w-full h-dvh pt-12">
      <SyncDetail session={session} source={source} />
    </div>
  );
}
