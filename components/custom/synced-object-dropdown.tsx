import { formatJson } from "@/lib/utils";
import { Button } from "../ui/button";
import { SyncedObject } from "@/db/schema"
import { useState } from "react";

export const SyncedObjectDropdown = ({ syncedObject, source }: { syncedObject: SyncedObject, source: string }) => {
  const [permissionsState, setPermissionsState] = useState<{ data: any | null, isLoading: boolean }>({ data: null, isLoading: false });

  const checkPermissions = async () => {
    const request = await fetch(`${window.location.origin}/api/permissions-check`, {
      method: "POST",
      body: JSON.stringify({
        object: syncedObject,
        source: source,
        role: "reader"
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const response = await request.json();
    console.log(response);
    setPermissionsState((prev) => ({ ...prev, data: response.data }));
  }

  return (
    <tr key={syncedObject.id + "data"} className="border-b">
      <td colSpan={4}>
        <div className="flex space-x-0">
          <div className="basis-2/3">
            <div className="font-semibold">Data: </div>
            <pre className="border border-slate-300 dark:border-slate-700 rounded m-4 p-2 whitespace-pre-wrap break-all text-xs bg-muted border-b">
              {formatJson(syncedObject.data?.toString() ?? "no data")}
            </pre>
          </div>
          <div className="flex flex-col basis-1/4">
            <div className="font-semibold">Permissions: </div>
            <Button
              variant="outline"
              size={"sm"}
              className="ml-4 mt-2 bg-indigo-700"
              onClick={() => checkPermissions()}
            >
              Check Permissions
            </Button>
            <pre className="w-full h-full border border-slate-300 dark:border-slate-700 rounded m-4 p-2 whitespace-pre-wrap break-all text-xs bg-muted border-b">
              {permissionsState.isLoading ? (
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
                <>
                  {formatJson(permissionsState.data ?? "")}
                </>
              )
              }
            </pre>
          </div>
        </div>
      </td>
    </tr >
  );
}
