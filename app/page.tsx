import { userWithToken } from "./(auth)/auth";
import { SyncTable } from "@/components/cust/sync-table";

export default async function Page() {
  const session = await userWithToken();
  return (
    <div className="flex justify-center max-w-full h-dvh pt-12">
      <SyncTable session={session} />
    </div>
  );
}
