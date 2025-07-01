"use client";
import React, { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { SyncedObject } from "@/db/schema";
import { ChevronDown } from "lucide-react";
import { SyncedObjectDropdown } from "./synced-object-dropdown";

export function SyncedObjectsView({ session, selectedSource, }: { session: { user: any, paragonUserToken?: string }, selectedSource: { name: string, type: string, icon: string | undefined }, }) {
  const [expandedRow, setExpandedRows] = useState<Set<string>>(new Set());
  const { data: syncedObjects, isLoading, } = useSWR<Array<SyncedObject>>(session ? `/api/records/?source=${selectedSource.type}` : null,
    fetcher, { fallbackData: [] });

  const toggleRow = (rowId: string) => {
    const newExpandedRows = new Set(expandedRow);
    if (newExpandedRows.has(rowId)) {
      newExpandedRows.delete(rowId);
    } else {
      newExpandedRows.add(rowId);
    }
    setExpandedRows(newExpandedRows);
  }


  return (
    <div className="overflow-y-scroll h-full py-3">
      {isLoading ? (
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
        <table className="w-full text-sm table-fixed">
          <thead className="border-b bg-muted">
            <tr>
              <th className="p-2 rounded-tl-md">id</th>
              <th className="p-2">external id</th>
              <th className="p-2">created at</th>
              <th className="p-2 rounded-tr-md">updated at</th>
            </tr>
          </thead>
          <tbody>
            {
              syncedObjects?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-2 font-semibold text-lg">
                    no data yet
                  </td>
                </tr>
              ) : (
                syncedObjects?.map((syncedObject) => {
                  return (
                    <React.Fragment key={syncedObject.id}>
                      <tr className={expandedRow.has(syncedObject.id) ? "" : "border-b"} key={syncedObject.id}>
                        <td className="text-sm p-2 text-center flex flex-row space-x-1">
                          <ChevronDown className={expandedRow.has(syncedObject.id) ? "rotate-180" : ""} onClick={() => toggleRow(syncedObject.id)} />
                          {syncedObject.syncObjectId}
                        </td>
                        <td className="text-sm p-2 text-center overflow-clip">{syncedObject.externalId}</td>
                        <td className="text-sm p-2 text-center">{new Date(syncedObject.createdAt.toString()).toString().split("GMT")[0]}</td>
                        <td className="text-sm p-2 text-center">{new Date(syncedObject.updatedAt.toString()).toString().split("GMT")[0]}</td>
                      </tr>
                      {expandedRow.has(syncedObject.id) &&
                        <SyncedObjectDropdown syncedObject={syncedObject} source={selectedSource.type} />
                      }
                    </React.Fragment>
                  )
                })
              )
            }
          </tbody>
        </table>
      )
      }
    </div >
  );
}
