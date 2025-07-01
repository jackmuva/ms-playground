"use client";

import { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useState } from "react";

import {
  Message as PreviewMessage,
  ThinkingMessage,
} from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";

import { MultimodalInput } from "./multimodal-input";
import { ExtendedSession, userWithToken } from "@/app/(auth)/auth";
import { Textarea } from "../ui/textarea";
import { LoadingSkeleton } from "./integrations";
import dynamic from "next/dynamic";
import { ParagraphTypes } from "@/lib/paragon/useParagon";
import { DropdownMenu } from "../ui/dropdown-menu";
import { FunctionTool } from "@/app/(chat)/api/chat/route";
import { ErrorIcon } from "./icons";
import { Input } from "../ui/input";
import { SyncedObjectsView } from "./synced-objects-view";
import { ActivityLogView } from "./activity-log-view";
import { BookOpenText, DatabaseZap } from "lucide-react";

const IntegrationsLazy = dynamic(() => import("./integrations"), {
  loading: () => (
    <div className="pt-12 pr-3 w-full">
      <LoadingSkeleton />
    </div>
  ),
  ssr: false,
});

enum ViewType {
  SYNCED_RECORDS,
  ACTIVITY_LOGS
}

export function Chat({
  id,
  initialMessages,
  session,
  savedPrompt,
  savedTools,
}: {
  id: string;
  initialMessages: Array<Message>;
  session: { user: any, paragonUserToken?: string };
  savedPrompt?: string | null;
  savedTools?: string[] | null;
}) {
  //TODO: Change this to impersonated user
  const [impersonatedUser, setImpersonatedUser] = useState(
    savedPrompt ?? "user@company.com"
  );
  const [tools, setTools] = useState<ParagraphTypes[string]>([]);
  const [actions, setActions] = useState<FunctionTool[]>([]);
  const [selectedSource, setSelectedSource] = useState<{ name: string, type: string, icon: string | undefined }>({ name: "", type: "", icon: undefined });
  const [view, setView] = useState<ViewType>(ViewType.SYNCED_RECORDS);

  const {
    messages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    error,
    reload,
  } = useChat({
    api: '/api/rag',
    body: {
      id,
      impersonatedUser,
    },
    initialMessages,
    onFinish: () => {
      window.history.replaceState({}, "", `/chat/${id}`);
    },
  });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>(isLoading);

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <div className="flex justify-between max-w-full h-dvh pt-12">
      <div className="p-3 bg-background min-w-[300px] w-80 overflow-y-scroll">
        <IntegrationsLazy
          session={session}
          onUpdateTools={setTools}
          onUpdateActions={setActions}
          initialToolsSelected={savedTools as string[]}
          setSelectedSourceAction={setSelectedSource}
        />
      </div>
      <div className="flex flex-col w-full pt-5 p-3 border-r">
        <div className="font-semibold text-lg flex items-center">
          {selectedSource.icon ? <img src={selectedSource.icon} className="ml-2 w-5 h-5 mr-2" /> : null}
          {selectedSource.name}
        </div>
        <div className="flex space-x-12 items-center min-h-12 border-b w-full">
          <div className={view === ViewType.SYNCED_RECORDS ? "text-indigo-700 dark:text-indigo-300 cursor-pointer font-bold flex i1ems-center space-x-1" :
            "items-center space-x-1 flex cursor-pointer"}
            onClick={() => { setView(ViewType.SYNCED_RECORDS) }}><DatabaseZap size={20} /><p>Synced Records</p></div>
          <div className={view === ViewType.ACTIVITY_LOGS ? "text-indigo-700 dark:text-indigo-300 cursor-pointer font-bold flex i1ems-center space-x-1" :
            "items-center space-x-1 flex cursor-pointer"}
            onClick={() => { setView(ViewType.ACTIVITY_LOGS) }}><BookOpenText size={20} /><p>Activity Logs</p> </div>
        </div>
        {
          view === ViewType.SYNCED_RECORDS ?
            <SyncedObjectsView session={session} selectedSource={selectedSource} />
            :
            <ActivityLogView session={session} selectedSource={selectedSource} />
        }
      </div>
      <div className="rounded-md w-[900px] py-5 mx-3">
        <div className="flex flex-col justify-between h-full">
          <div className="mb-4">
            <p className="font-semibold text-sm mb-2">Impersonate User</p>
            <Input
              value={impersonatedUser}
              className="min-h-[24px] overflow-y-scroll rounded-lg text-base"
              onChange={(e) => setImpersonatedUser(e.target.value)}
            />
          </div>
          <div
            ref={messagesContainerRef}
            className="overflow-y-scroll h-full flex flex-col gap-2 pr-3"
          >
            {messages.map((message) => (
              <PreviewMessage
                key={message.id}
                role={message.role}
                content={message.content}
                attachments={message.experimental_attachments}
                toolInvocations={message.toolInvocations}
                annotations={message.annotations}
              />
            ))}
            {isLoading &&
              messages.length > 0 &&
              messages[messages.length - 1].role === "user" && (
                <ThinkingMessage />
              )}
            {error && (
              <PreviewMessage
                key="error"
                role="assistant"
                content={
                  <div>
                    <p className="text-red-400 mt-1 flex items-center">
                      <ErrorIcon />
                      <span className="ml-1">
                        <span className="">Error generating response.</span>{" "}
                        {error?.message}
                      </span>
                    </p>
                    <button
                      className="font-bold text-sm"
                      type="button"
                      onClick={() => reload()}
                    >
                      Retry
                    </button>
                  </div>
                }
                toolInvocations={[]}
              />
            )}
            <div
              ref={messagesEndRef}
              className="shrink-0 min-w-[24px] min-h-[24px]"
            />
          </div>

          <form className="flex flex-row gap-2 relative items-end w-full px-4 md:px-0">
            <MultimodalInput
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              append={append}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
