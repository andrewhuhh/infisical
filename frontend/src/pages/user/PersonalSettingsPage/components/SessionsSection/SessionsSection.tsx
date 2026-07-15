import { faBan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { createNotification } from "@app/components/notifications";
import { Button } from "@app/components/v2";
import { useRevokeMySessions } from "@app/hooks/api";

import { SessionsTable } from "./SessionsTable";

export const SessionsSection = () => {
  const { mutateAsync, isPending } = useRevokeMySessions();

  const onRevokeAllSessionsClick = async () => {
    try {
      await mutateAsync();
      window.location.href = "/login";
    } catch {
      createNotification({
        text: "Failed to revoke sessions. Try again.",
        type: "error"
      });
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-mineshaft-600 bg-mineshaft-900 p-4">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex-1 text-xl font-medium text-mineshaft-100">Sessions</h2>
        <Button
          className="w-full sm:w-auto"
          colorSchema="secondary"
          type="button"
          leftIcon={<FontAwesomeIcon icon={faBan} />}
          isDisabled={isPending}
          isLoading={isPending}
          onClick={onRevokeAllSessionsClick}
        >
          Revoke all
        </Button>
      </div>
      <p className="mb-8 text-gray-400">
        Logging into Infisical via browser or CLI creates a session. Revoking all sessions logs your
        account out all active sessions across all browsers and CLIs.
      </p>
      <SessionsTable />
    </div>
  );
};
