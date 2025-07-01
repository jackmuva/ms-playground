import { Activity } from "@/db/schema";
import { fetcher } from "@/lib/utils";
import React, { useState } from "react";
import useSWR from "swr";
import { ChevronDown } from "lucide-react";
import { ActivityDropdown } from "./activity-dropdown";

export const ActivityLogView = ({ session, selectedSource, }: { session: { user: any, paragonUserToken?: string }, selectedSource: { name: string, type: string, icon: string | undefined }, }) => {
  const [expandedRow, setExpandedRows] = useState<Set<string>>(new Set());
  const { data: activities, isLoading, } = useSWR<Array<Activity>>(session ? `/api/activity/?source=${selectedSource.type}` : null,
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
      <table className="w-full text-sm table-fixed overflow-y-scroll">
        <thead className="border-b bg-muted">
          <tr>
            <th className="p-2 rounded-tl-md">id</th>
            <th className="p-2">event</th>
            <th className="p-2">received at</th>
          </tr>
        </thead>
        <tbody>
          {
            activities?.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center p-2 font-semibold text-lg">
                  no data yet
                </td>
              </tr>
            ) :
              (
                activities?.map((activity) => {
                  return (
                    <React.Fragment key={activity.id}>
                      <tr className={expandedRow.has(activity.id) ? "" : "border-b"} key={activity.id}>
                        <td className="text-sm p-2 text-center flex flex-row space-x-1">
                          <ChevronDown className={expandedRow.has(activity.id) ? "rotate-180" : ""} onClick={() => toggleRow(activity.id)} />
                          {activity.id}
                        </td>
                        <td className="text-sm p-2 text-center overflow-clip">{activity.event}</td>
                        <td className="text-sm p-2 text-center">{new Date(activity.receivedAt.toString()).toString().split("GMT")[0]}</td>
                      </tr>
                      {expandedRow.has(activity.id) &&
                        <ActivityDropdown activity={activity} />
                      }
                    </React.Fragment>
                  )
                })
              )
          }
        </tbody>
      </table>

    </div>
  );
}
