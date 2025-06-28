import React from "react";

import { getSettingsSA } from "@/services/settings/settingsService";
import { getSessionServer } from "@/helpers/getSessionServer";

import SettingsForm from "./_components/SettingsForm";

const AdminSettingsPage = async () => {
  const breadcrumbItems = [
    { title: "Settings", link: "/admin-dashboard/settings" },
  ];

  const settings = await getSettingsSA();

  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <SettingsForm settings={settings} />
      </div>
    </>
  );
};

export default AdminSettingsPage;
