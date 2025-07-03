import useSWR from "swr";
import { SyncPipeline } from "@/db/schema";
import { fetcher } from "@/lib/utils";

export const WebhooksTable = ({
  source,
  session,
}: {
  source: string,
  session: { user: any, paragonUserToken?: string },
}) => {
  return (
    <></>
  );
}
