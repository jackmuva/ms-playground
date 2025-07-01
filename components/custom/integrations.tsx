"use client";

import useParagon, { ParagraphTypes } from "@/lib/paragon/useParagon";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useEffect, useState, useRef } from "react";
import { ChevronDownIcon } from "./icons";

import { Button } from "../ui/button";
import { FunctionTool } from "@/app/(chat)/api/chat/route";
import { toast } from "sonner";
import { formatJson } from "@/lib/utils";
import { ArrowBigDownDash, SquareActivity, Zap } from "lucide-react";
import { mutate } from "swr";

type IntegrationTileProps = {
  integration: {
    icon: string;
    name: string;
    type: string;
  };
  integrationEnabled?: boolean;
  onConnect: () => void;
  tools?: {
    name: string;
    title: string;
  }[];
  actions?: FunctionTool[];
  selectedTools: string[];
  onToolSelectToggle: (name: string, checked: CheckedState) => void;
  onToolSelectAllToggle: (checked: CheckedState) => void;
  setSelectedSource: (source: { name: string, type: string, icon: string }) => void;
  userId: string;
};

function IntegrationTile({
  integration,
  integrationEnabled,
  tools = [],
  actions = [],
  selectedTools,
  onConnect,
  onToolSelectAllToggle,
  onToolSelectToggle,
  setSelectedSource,
  userId,
}: IntegrationTileProps) {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (integrationEnabled) {
      setExpanded((prev) => !prev);
    } else {
      onConnect();
    }
  };

  //NOTE: for demo purposes, we'll be triggering data pulls manually by hitting
  //the webhook endpoint, rather than using the Sync API to hit the endpoint
  //-----------------
  //this is because our current implementation of Managed Sync is an on-prem
  //deployment
  //-----------------
  //When using on cloud plan, we can use triggerSync instead of triggerWebhookDataPull
  const triggerSyncPipeline = async (integration: string): Promise<void> => {
    const req = await fetch(`${window.location.origin}/api/trigger?integration=${integration}`, {
      headers: {
        "Content-Type": "application/json"
      },
    });
    const res = await req.json();
    if (res) {
      mutate(`/api/activity/?source=${integration}`)
      toast(`Sync Pipeline for ${integration}: ${res.message}`);
    }
  }

  const triggerDataPullWebhook = async (integration: string): Promise<void> => {
    toast(`Pulling Records for ${integration} - We'll notify you when file metadata has been pulled`);
    const req = await fetch(`${window.location.origin}/api/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        event: "sync_complete",
        sync: integration,
        user: {
          id: userId
        },
        data: {
          model: "File",
          synced_at: new Date().toISOString(),
        }
      }),
    });
    const res = await req.json();
    if (res) {
      mutate(`/api/records/?source=${integration}`)
      toast(`Metadata Pulled - Background job is indexing the vector database. Data will be usable in a few minutes`);
    }
  }


  const checkSyncStatus = async (integration: string): Promise<void> => {
    const req = await fetch(`${window.location.origin}/api/status?integration=${integration}`, {
      headers: {
        "Content-Type": "application/json"
      },
    });
    const res = await req.json();
    toast(`For ${integration} Sync: ${formatJson(res.status)}`);
  }

  return (
    <div className="w-full mb-2 mr-2 rounded-lg" key={integration.type}>
      <div className="border border-slate-300 dark:border-slate-700 rounded">
        <div
          className="p-4 flex items-center rounded rounded-br-none rounded-bl-none justify-between hover:bg-gray-100 dark:hover:bg-secondary cursor-pointer"
          onClick={integrationEnabled ? () => { setSelectedSource({ name: integration.name, type: integration.type, icon: integration.icon }) } : () => { handleClick() }}
        >
          <div className="flex items-center">
            <img src={integration.icon} className="w-4 h-4 mr-2" />
            <p className="text-sm font-semibold">{integration.name}</p>
          </div>
          <div className="flex items-center">
            <div
              className={`rounded mr-2 p-1 px-2 inline-flex items-center bg-opacity-30 dark:bg-opacity-30 ${integrationEnabled
                ? "bg-green-400 dark:bg-green-400"
                : "bg-slate-200 dark:bg-slate-400"
                }`}
            >
              <div
                className={`rounded-full h-2 w-2 ${integrationEnabled ? "bg-green-500" : "bg-slate-300"
                  } mr-1`}
              />
              <p
                className={`text-xs font-semibold ${integrationEnabled
                  ? "text-green-600 dark:text-green-500"
                  : "text-slate-500 dark:text-slate-300"
                  }`}
              >
                {integrationEnabled ? "Connected" : "Disabled"}
              </p>
            </div>
            {integrationEnabled ? (
              <div className={expanded ? "bg-muted hover:bg-white text-muted-foreground rounded-full justify-center items-center rotate-180" : "bg-muted hover:bg-white text-muted-foreground rounded-full justify-center items-center"} onClick={handleClick}>
                <ChevronDownIcon size={20} />
              </div>
            ) : null}
          </div>
        </div>
        {expanded ? (
          <div className="border-t p-4 pt-2">
            <div className="flex flex-col space-y-2">
              <div className="flex flex-col space-y-2 border rounded-md p-3">
                <div className="text-sm font-semibold">Managed Sync</div>
                <div className="flex flex-col items-start">
                  <Button
                    variant="link"
                    size="sm"
                    className="flex space-x-1 justify-start p-0"
                    onClick={() => triggerSyncPipeline(integration.type)}
                  >
                    <Zap size={10} />
                    <p>Trigger Sync</p>
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="flex space-x-1 justify-start p-0"
                    onClick={() => checkSyncStatus(integration.type)}
                  >
                    <SquareActivity size={10} />
                    <p>Check Sync Status</p>
                  </Button>

                  <Button
                    variant="link"
                    size="sm"
                    className="flex space-x-1 justify-start p-0"
                    onClick={() => triggerDataPullWebhook(integration.type)}
                  >
                    <ArrowBigDownDash size={10} />
                    <p>Pull Data</p>
                  </Button>

                </div>
              </div>
              <div className="flex">
                <Button
                  variant="outline"
                  size="sm"
                  className=""
                  onClick={() => onConnect()}
                >
                  Configure
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div >
  );
}

export default function Integrations({
  session,
  initialToolsSelected,
  onUpdateTools,
  onUpdateActions,
  setSelectedSourceAction,
}: {
  session: { paragonUserToken?: string };
  setSelectedSourceAction: (source: { name: string, type: string, icon: string }) => void;
  initialToolsSelected?: string[];
  onUpdateTools?: (tools: ParagraphTypes[string]) => void;
  onUpdateActions?: (actions: FunctionTool[]) => void;
}) {
  const { user, paragon, actionTypes } = useParagon(
    session.paragonUserToken ?? ""
  );
  const integrations = paragon?.getIntegrationMetadata() ?? [];
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const hasSetInitialSource = useRef(false);

  useEffect(() => {
    if (initialToolsSelected) {
      setSelectedTools(initialToolsSelected);
    }
  }, [initialToolsSelected]);

  useEffect(() => {
    if (user?.authenticated && integrations.length > 0 && !hasSetInitialSource.current) {
      hasSetInitialSource.current = true;
      setSelectedSourceAction({
        name: integrations[0].name,
        type: integrations[0].type,
        icon: integrations[0].icon
      });
    }
  }, [user?.authenticated, integrations.length]);

  useEffect(() => {
    if (onUpdateActions) {
      onUpdateActions(
        selectedTools
          .map((tool) =>
            Object.values(actionTypes)
              .flatMap((v) => v)
              .find((type) => type.function.name === tool)
          )
          .filter((tool) => tool != null)
      );
    }
  }, [selectedTools, actionTypes, onUpdateTools]);

  const handleItemCheck = (id: string, checked: CheckedState) => {
    if (checked === true) {
      setSelectedTools((prev) => [...prev, id]);
    } else {
      setSelectedTools((prev) => prev.filter((item) => item !== id));
    }
  };

  return (
    <div className="pt-3">
      <div className="flex items-center justify-between w-full">
        <h1 className="font-semibold text-sm mt-2 mb-2">Sources</h1>
      </div>
      <div className="flex flex-wrap">
        {user?.authenticated ? (
          integrations
            .sort((a, b) => {
              if (
                user.integrations?.[a.type]?.enabled &&
                !user?.integrations?.[b.type]?.enabled
              ) {
                return -1;
              }
              if (
                user.integrations?.[b.type]?.enabled &&
                !user?.integrations?.[a.type]?.enabled
              ) {
                return 1;
              }
              return a.type < b.type ? -1 : 1;
            })
            .map((integration) => (
              <IntegrationTile
                integration={integration}
                onConnect={() => paragon!.connect(integration.type, {})}
                onToolSelectAllToggle={(checked: CheckedState) => {
                  if (checked === true) {
                    setSelectedTools((prev) => {
                      const set = new Set(prev);
                      actionTypes[integration.type]?.forEach((intent) =>
                        set.add(intent.function.name)
                      );
                      return Array.from(set);
                    });
                  } else {
                    setSelectedTools((prev) => {
                      return prev.filter(
                        (type) =>
                          !actionTypes[integration.type].some(
                            (intent) => intent.function.name === type
                          )
                      );
                    });
                  }
                }}
                onToolSelectToggle={handleItemCheck}
                selectedTools={selectedTools}
                integrationEnabled={
                  user?.authenticated &&
                  user?.integrations?.[integration.type]?.enabled
                }
                key={integration.type}
                actions={actionTypes[integration.type]}
                setSelectedSource={setSelectedSourceAction}
                userId={user.userId}
              />
            ))
        ) : (
          <LoadingSkeleton />
        )}
      </div>
    </div>
  );
}

export const LoadingSkeleton = () => {
  return Array(5)
    .fill(null)
    .map((_, i) => (
      <div
        className={`w-full mb-2 mr-2 rounded-lg cursor-pointer animate-pulse`}
        key={i}
      >
        <div className="border border-slate-300 dark:border-slate-700 rounded p-4">
          <div className="flex items-center mb-1">
            <div className="inline w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-500 mr-2" />
            <div className="inline rounded-full w-48 h-2 bg-slate-200 dark:bg-slate-500" />
          </div>
        </div>
      </div>
    ));
};

function formatString(input: string): string {
  const parts = input.split("_").slice(1);

  const shouldKeepCapitalized = (part: string): boolean => {
    return part === "ID" || part.endsWith("QL");
  };

  const formattedParts = parts.map((part) => {
    if (shouldKeepCapitalized(part)) {
      return part;
    }
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
  });

  return formattedParts.join(" ");
}
