import { useRef } from "react";
import { faBan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { SearchIcon, XIcon } from "lucide-react";

import { createNotification } from "@app/components/notifications";
import { Button } from "@app/components/v2";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@app/components/v3";
import { useRevokeMySessions } from "@app/hooks/api";

import { SessionsTable } from "./SessionsTable";

export const SessionsSection = () => {
  const isRevokingAllRef = useRef(false);
  const navigate = useNavigate({ from: "/_authenticate/personal-settings/_layout/" });
  const { sessionSearch } = useSearch({
    from: "/_authenticate/personal-settings/_layout/"
  });
  const { mutateAsync, isPending } = useRevokeMySessions();

  const setSessionSearch = (value: string) => {
    navigate({
      search: (prev: { sessionSearch?: string }) => ({
        ...prev,
        sessionSearch: value.trim() ? value : undefined
      }),
      replace: true
    });
  };

  const onRevokeAllSessionsClick = async () => {
    if (isRevokingAllRef.current) return;

    isRevokingAllRef.current = true;
    try {
      await mutateAsync();
      window.location.href = "/login";
    } catch {
      createNotification({
        text: "Failed to revoke sessions. Try again.",
        type: "error"
      });
    } finally {
      isRevokingAllRef.current = false;
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-mineshaft-600 bg-mineshaft-900 p-4">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="flex-1 text-xl font-medium text-mineshaft-100">Sessions</h2>
        <Button
          colorSchema="secondary"
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
      <div className="w-full sm:max-w-md">
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            id="session-search"
            type="search"
            aria-label="Filter sessions"
            autoComplete="off"
            placeholder="Filter by IP, session ID, OS, or browser..."
            value={sessionSearch ?? ""}
            onChange={(event) => setSessionSearch(event.target.value)}
          />
          {Boolean(sessionSearch?.trim()) && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="xs"
                aria-label="Clear session filter"
                onClick={() => setSessionSearch("")}
              >
                <XIcon />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>
      <SessionsTable search={sessionSearch ?? ""} />
    </div>
  );
};
