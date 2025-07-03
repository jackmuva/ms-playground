"use client";
import useSWR from "swr";
import { SyncPipeline } from "@/db/schema";
import { fetcher } from "@/lib/utils";
import { useState } from "react";

export enum Tab {
	RECORDS = "Records",
	PERMISSIONS = "Permissions Explorer",
	API = "API",
	WEBHOOKS = "Webhook Updates"
}

export const SyncTabContent = ({
	source,
	session
}: {
	source: string,
	session: { user: any, paragonUserToken?: string }
}) => {
	const [activeTab, setActiveTab] = useState<string>(Tab.RECORDS);
	return (
		<>
			<div className="flex space-x-8 items-center">
				{['Records', 'Permissions Explorer', 'Webhook Updates', 'API'].map((tab) => {
					return (
						<div key={tab}
							className={`cursor-pointer ${activeTab === tab ? "text-indigo-600 border-b-2 border-indigo-600" : "text-muted-foreground hover:text-foreground"}`}
							onClick={() => setActiveTab(tab)}>
							{tab}
						</div>
					);
				})}
			</div>
		</>
	);
}
