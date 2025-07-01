import { Activity } from "@/db/schema"
import { formatJson } from "@/lib/utils";

export const ActivityDropdown = ({ activity }: { activity: Activity }) => {

  return (
    <tr key={activity.id + "data"} className="border-b">
      <td colSpan={3}>
        <div className="font-semibold">Data: </div>
        <pre className="border border-slate-300 dark:border-slate-700 rounded m-4 p-2 whitespace-pre-wrap break-all text-xs bg-muted border-b">
          {formatJson(activity.data?.toString() ?? "no data")}
        </pre>
      </td>
    </tr >
  );
}
