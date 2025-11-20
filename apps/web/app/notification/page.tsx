import { CustomBreadcrumb } from "@/components/custom-breadcrumb/breadcrumb-custom-component";

import NotificationSetup from "@/components/push-notification";
import { BellRing } from "lucide-react";

export default function NotificationPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <CustomBreadcrumb
        icon={<BellRing className="h-4 w-4" />}
        items={[
          { link: "/task", text: "Home" },
          { link: "/notification", text: "Notification" },
        ]}
      />

      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Push Notification</h1>
        <p className="text-gray-600 mb-8">
          Set up push notifications to keep your team informed about task
          updates, comments, and other important events.
        </p>

        <NotificationSetup />
      </div>
    </div>
  );
}
