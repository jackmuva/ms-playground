import useSWR from "swr";
import { SyncPipeline, Webhook } from "@/db/schema";
import { fetcher } from "@/lib/utils";

export const WebhooksTable = ({
  source,
  session,
}: {
  source: string,
  session: { user: any, paragonUserToken?: string },
}) => {
  const { data: webhooks, isLoading, } = useSWR<Array<Webhook>>(session ? `/api/records/?source=${source}` : null,
    fetcher, { fallbackData: [] });

  return (
    <div className="py-3">
      {(isLoading) ? (
        <div className="flex flex-col">
          {[44, 32, 28, 52].map((item) => (
            <div key={item} className="p-2 my-[2px]">
              <div
                className={`w-${item} h-[20px] rounded-md bg-zinc-200 dark:bg-zinc-600 animate-pulse`}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="h-[500px] overflow-hidden">
          <div className="h-full overflow-y-auto">
            <table className="w-full text-sm table-fixed">
              <thead className="font-semibold sticky top-0 z-10 bg-background">
                <tr>
                  <th className="p-2 text-left w-3/12">Event Type</th>
                  <th className="p-2 text-left w-3/12">Event Time</th>
                  <th className="p-2 text-left w-5/12">File ID</th>
                  <th className="p-2 w-1/12"></th>
                </tr>
              </thead>
              <tbody className="border rounded-sm">
                {
                  webhooks?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="h-52 text-center p-2 font-semibold text-lg">
                        no data yet
                      </td>
                    </tr>
                  ) : (
                    webhooks?.map((webhook) => {
                      return (
                        <tr key={webhook.id} className="border-b hover:bg-muted/50">
                          <td className="text-sm p-2">
                            {webhook.event}
                          </td>
                          <td className="text-sm p-2">
                            {new Date(webhook.receivedAt.toString()).toLocaleString()}
                          </td>
                          <td className="text-sm p-2">
                            {JSON.parse(webhook.data as string).file ?? ""}
                          </td>
                          <td className="p-4">
                          </td>
                        </tr>
                      )
                    })
                  )
                }
              </tbody>
            </table>
          </div>
        </div>
      )
      }
    </div >
  );
}
