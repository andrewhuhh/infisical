import {
  faMagnifyingGlass,
  faServer,
  faTriangleExclamation
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { SearchIcon, XIcon } from "lucide-react";

import { createNotification } from "@app/components/notifications";
import {
  DeleteActionModal,
  EmptyState,
  Table,
  TableContainer,
  TableSkeleton,
  TBody,
  Td,
  Th,
  THead,
  Tooltip,
  Tr
} from "@app/components/v2";
import { Button } from "@app/components/v2/Button";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@app/components/v3";
import { useGetMySessions, useRevokeMySessionById } from "@app/hooks/api";
import { usePopUp } from "@app/hooks/usePopUp";
import { timeAgo } from "@app/lib/fn/date";
import { formatSessionUserAgent } from "@app/lib/fn/string";

import { filterSessions } from "./SessionsTable.utils";

const formatLocalDateTime = (date: Date): string => {
  return date.toLocaleString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

export const SessionsTable = () => {
  const navigate = useNavigate();
  const sessionSearch =
    useSearch({
      strict: false,
      select: (search) => search.sessionSearch
    }) ?? "";
  const { data, isPending, isError, isFetching, refetch } = useGetMySessions();
  const { mutateAsync: revokeMySessionById, isPending: isRevokingSession } =
    useRevokeMySessionById();
  const { popUp, handlePopUpOpen, handlePopUpClose, handlePopUpToggle } = usePopUp([
    "deleteSession"
  ] as const);
  const filteredSessions = filterSessions(data ?? [], sessionSearch);
  const hasActiveFilter = Boolean(sessionSearch.trim());
  const hasNoSessions = !isPending && !isError && data?.length === 0;
  const hasNoMatchingSessions =
    !isPending && !isError && Boolean(data?.length) && filteredSessions.length === 0;

  const updateSessionSearch = (value: string) => {
    navigate({
      to: ".",
      replace: true,
      search: {
        sessionSearch: value.trim() ? value : undefined
      }
    });
  };

  const handleSignOut = async (sessionId: string) => {
    try {
      await revokeMySessionById(sessionId);
      createNotification({
        text: "Session revoked successfully",
        type: "success"
      });

      handlePopUpClose("deleteSession");
    } catch {
      createNotification({
        text: "Failed to revoke session. Try again.",
        type: "error"
      });
    }
  };

  return (
    <>
      <DeleteActionModal
        isOpen={popUp.deleteSession.isOpen}
        title="Are you sure you want to sign out of this session?"
        onChange={(isOpen) => handlePopUpToggle("deleteSession", isOpen)}
        deleteKey="confirm"
        buttonText="Sign out"
        isDisabled={isRevokingSession}
        onDeleteApproved={() =>
          handleSignOut((popUp?.deleteSession?.data as { sessionId: string })?.sessionId)
        }
      />
      <div className="mb-4 max-w-xl">
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            id="session-search"
            type="search"
            aria-label="Filter sessions"
            value={sessionSearch}
            onChange={(event) => updateSessionSearch(event.target.value)}
            placeholder="Filter by IP, session ID, OS, or browser..."
          />
          {hasActiveFilter && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label="Clear session filter"
                size="xs"
                onClick={() => updateSessionSearch("")}
              >
                <XIcon />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>
      {!isPending && isError && (
        <TableContainer className="mt-4 py-4">
          <EmptyState title="Could not load sessions" icon={faTriangleExclamation}>
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs text-bunker-300">Check your connection and try again.</p>
              <Button
                colorSchema="secondary"
                variant="outline"
                isDisabled={isFetching}
                isLoading={isFetching}
                onClick={() => refetch()}
              >
                Try again
              </Button>
            </div>
          </EmptyState>
        </TableContainer>
      )}
      {hasNoSessions && (
        <TableContainer className="mt-4 py-4">
          <EmptyState title="No sessions on file" icon={faServer} />
        </TableContainer>
      )}
      {hasNoMatchingSessions && (
        <TableContainer className="mt-4 py-4">
          <EmptyState title="No sessions match this filter" icon={faMagnifyingGlass}>
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs text-bunker-300">
                Try a different IP, session ID, operating system, or browser.
              </p>
              <Button
                colorSchema="secondary"
                variant="outline"
                onClick={() => updateSessionSearch("")}
              >
                Clear filter
              </Button>
            </div>
          </EmptyState>
        </TableContainer>
      )}
      {(isPending || filteredSessions.length > 0) && (
        <TableContainer className="mt-4">
          <Table className="min-w-[720px]">
            <THead>
              <Tr>
                <Th>IP & Session ID</Th>
                <Th>OS & Browser</Th>
                <Th>Last accessed</Th>
                <Th>Manage</Th>
              </Tr>
            </THead>
            <TBody>
              {isPending && <TableSkeleton columns={4} innerKey="sessions" />}
              {!isPending &&
                filteredSessions.map(({ id, createdAt, lastUsed, ip, userAgent }) => {
                  const { os, browser } = formatSessionUserAgent(userAgent);
                  const lastUsedDate = new Date(lastUsed);
                  const createdAtDate = new Date(createdAt);

                  return (
                    <Tr className="h-20" key={`session-${id}`}>
                      <Td>
                        <div className="flex flex-col">
                          <span className="font-medium">{ip}</span>
                          <span className="text-sm text-gray-500">ID: {id}</span>
                        </div>
                      </Td>
                      <Td>
                        <div className="flex flex-col">
                          <span className="font-medium">{os}</span>
                          <span className="text-sm text-gray-500">{browser}</span>
                        </div>
                      </Td>
                      <Td>
                        <div className="flex flex-col">
                          <Tooltip content={formatLocalDateTime(lastUsedDate)}>
                            <span className="font-medium">{timeAgo(lastUsedDate, new Date())}</span>
                          </Tooltip>
                          <Tooltip content={formatLocalDateTime(createdAtDate)}>
                            <span className="text-sm text-gray-500">
                              Created {timeAgo(createdAtDate, new Date())}
                            </span>
                          </Tooltip>
                        </div>
                      </Td>
                      <Td>
                        <Button
                          variant="plain"
                          colorSchema="danger"
                          isDisabled={isRevokingSession}
                          onClick={() => handlePopUpOpen("deleteSession", { sessionId: id })}
                        >
                          Sign out
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
            </TBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};
