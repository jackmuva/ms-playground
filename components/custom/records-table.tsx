import useSWR from "swr";
import { Record, SyncPipeline } from "@/db/schema";
import { downloadRecord, fetcher } from "@/lib/utils";
import { Download } from "lucide-react";

export const RecordsTable = ({
  source,
  session,
}: {
  source: string,
  session: { user: any, paragonUserToken?: string },
}) => {
  const { data: records, isLoading, } = useSWR<Array<Record>>(session ? `/api/records/?source=${source}` : null,
    fetcher, { fallbackData: [] });

  const { data: sync, isLoading: isSyncLoading } = useSWR<Array<SyncPipeline>>(session ? `/api/get-sync?source=${source}` : null,
    fetcher, { fallbackData: [] });

  return (
    <div className="py-3">
      {(isLoading || isSyncLoading) ? (
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
                  <th className="p-2 text-left w-3/12">Name</th>
                  <th className="p-2 text-left w-3/12">MIME Type</th>
                  <th className="p-2 text-left w-2/12">Created</th>
                  <th className="p-2 text-left w-2/12">Updated</th>
                  <th className="p-2 text-left w-1/12">Size (kb)</th>
                  <th className="p-2 w-1/12"></th>
                </tr>
              </thead>
              <tbody className="border rounded-sm">
                {
                  records?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="h-52 text-center p-2 font-semibold text-lg">
                        no data yet
                      </td>
                    </tr>
                  ) : (
                    records?.map((record) => {
                      return (
                        <tr key={record.id} className="border-b hover:bg-muted/50 cursor-pointer"
                          onClick={() => { console.log('hi') }}>
                          <td className="text-sm p-2">
                            {JSON.parse(record.data as string).name ?? ""}
                          </td>
                          <td className="text-sm p-2">
                            {JSON.parse(record.data as string).mime_type ?? ""}
                          </td>
                          <td className="text-sm p-2">
                            {new Date(record.createdAt.toString()).toLocaleString()}
                          </td>
                          <td className="text-sm p-2">
                            {new Date(record.updatedAt.toString()).toLocaleString()}
                          </td>
                          <td className="text-sm p-2">
                            {JSON.parse(record.data as string).size ?? ""}
                          </td>
                          <td className="p-4">
                            <Download className="cursor-pointer h-4 w-4 place-self-end" onClick={(e) => {
                              e.stopPropagation();
                              downloadRecord(sync![0].syncId, record.syncObjectId);
                            }} />
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
