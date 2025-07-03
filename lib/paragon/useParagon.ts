import { paragon } from "@useparagon/connect";
import { useCallback, useEffect, useState } from "react";


export const CRM_CATEGORY = ['salesforce', 'hubspot']
export const FILE_CATEGORY = ['googledrive', 'box', 'dropbox', 'sharepoint']
export const ICONS = {
  googledrive: "https://cdn.useparagon.com/latest/dashboard/public/integrations/googledrive.svg",
}

export default function useParagon(paragonUserToken: string) {
  const [user, setUser] = useState(paragon ? paragon.getUser() : null);
  const [error, setError] = useState();

  const updateUser = useCallback(async () => {
    if (!paragon) {
      return;
    }
    const authedUser = paragon.getUser();

    setUser({ ...authedUser });
  }, []);

  // Listen for account state changes
  useEffect(() => {
    // @ts-ignore
    paragon.subscribe("onIntegrationInstall", updateUser);
    // @ts-ignore
    paragon.subscribe("onIntegrationUninstall", updateUser);
    return () => {
      // @ts-ignore
      paragon.unsubscribe("onIntegrationInstall", updateUser);
      // @ts-ignore
      paragon.unsubscribe("onIntegrationUninstall", updateUser);
    };
  }, []);

  useEffect(() => {
    if (!error && paragon) {
      paragon
        .authenticate(
          process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID!,
          paragonUserToken
        )
        .then(updateUser)
        .catch(setError);
    }
  }, [error, paragonUserToken]);

  return {
    paragon,
    user,
    error,
    updateUser,
  };
}
