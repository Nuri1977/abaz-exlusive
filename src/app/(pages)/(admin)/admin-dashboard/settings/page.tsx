import React from "react";

import { getSettingsSA } from "@/services/settings/settingsService";
import { getSessionServer } from "@/helpers/getSessionServer";

import SettingsForm from "./_components/SettingsForm";

const AdminSettingsPage = async () => {
  const settings = await getSettingsSA();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Configure system settings and preferences.
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
};

export default AdminSettingsPage;
