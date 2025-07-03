import { ClipboardCopy, X } from "lucide-react"
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Record } from "@/db/schema";
import { formatJson } from "@/lib/utils";

export const FileDetailModal = ({
  closeModal,
  syncId,
  record,
}: {
  closeModal: () => void,
  syncId: string,
  record: Record,
}) => {
  return (
    <div className="fixed z-50 inset-0 flex justify-center items-center bg-black/80 w-dvw h-dvh" onClick={() => closeModal()}>
      <div className="py-2 px-4 flex flex-col space-y-2 relative bg-muted rounded-sm max-w-96 max-h-[400px] w-full h-full overflow-y-scroll" onClick={(e) => e.stopPropagation()}>
        <div className="flex w-full justify-between items-center">
          <h1 className="text-lg font-semibold">File: {JSON.parse(record.data).name}</h1>
          <div className="rounded-sm opacity-70 ring-offset-background hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              closeModal();
            }} />
          </div>
        </div>
        <div className="flex flex-col space-y-6 h-full">
          <div className="flex h-1/3 rounded-sm border border-foreground">
            <div className="flex flex-col w-1/3 p-2 h-full justify-evenly">
              <p className="text-sm font-semibold">Mime Type</p>
              <p className="text-sm font-semibold">Date Created</p>
              <p className="text-sm font-semibold">Date Updated</p>
              <p className="text-sm font-semibold">Link</p>
            </div>
            <div className="flex flex-col w-2/3 p-2 h-full justify-evenly">
              <p className="text-sm truncate">{JSON.parse(record.data).mime_type}</p>
              <p className="text-sm truncate">{new Date(record.createdAt).toLocaleString()}</p>
              <p className="text-sm truncate">{new Date(record.updatedAt).toLocaleString()}</p>
              <a className="text-sm text-indigo-400 hover:text-indigo-500" href={JSON.parse(record.data).url}
                target="_blank">
                View in Google Drive
              </a>
            </div>

          </div>
          <div className="flex flex-col space-y-1 h-1/2">
            <div className="flex justify-between items-center">
              <div className="flex flex-col space-x-1">
                <h2 className="font-semibold">Normalized File Metadata</h2>
                <a href="https://paragon-managed-sync.mintlify.app/managed-sync/synced-objects" target="_blank"
                  className="text-indigo-400 hover:text-indigo-500 text-sm">View Schema Docs</a>
              </div>
              <Button
                variant="default"
                size={"sm"}
                className={`bg-indigo-700 text-white flex space-x-1`}
              >
                <ClipboardCopy className="h-4 w-4" />
                <p>Copy JSON</p>
              </Button>
            </div>
            <div className="flex text-sm h-48 overflow-y-scroll p-1 rounded-sm border border-foreground">
              {formatJson(record.data)}
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}
