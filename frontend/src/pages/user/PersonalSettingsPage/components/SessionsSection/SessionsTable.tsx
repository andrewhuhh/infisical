import { useMemo, useRef } from "react";
import { faRotateRight, faServer, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
import { useGetMySessions, useRevokeMySessionById } from "@app/hooks/api";
import { usePopUp } from "@app/hooks/usePopUp";
import { timeAgo } from "@app/lib/fn/date";
import { formatSessionUserAgent } from "@app/lib/fn/string";

import { filterSessions } from "./filterSessions";

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

type Props = {
  search: string;
};

export const SessionsTable = ({ search }: Props) => {
  const isRevokingSessionRef = useRef(false);
  const { data, isPending, isError, refetch, isFetching } = useGetMySessions();
  const { mutateAsync: revokeMySessionById, isPending: isRevokingSession } =
    useRevokeMySessionById();
  const { popUp, handlePopUpOpen, handlePopUpClose, handlePopUpToggle } = usePopUp([
    "deleteSession"
  ] as const);

  const filteredSessions = useMemo(() => {
    return filterSessions(data ?? [], search);
  }, [data, search]);

  const handleSignOut = async (sessionId: string) => {
    if (isRevokingSessionRef.current) return;

    isRevokingSessionRef.current = true;
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
    } finally {
      isRevokingSessionRef.current = false;
    }
  };

  return (
    <>
      <DeleteActionModal
        isOpen={popUp.deleteSession.isOpen}
        title="Are you sure you want to sign out of this session?"
        onChange={(isOpen) => handlePopUpToggle("deleteSession", isOpen)}
        deleteKey="confirm"
        isDisabled={isRevokingSession}
        onDeleteApproved={() =>
          handleSignOut((popUp?.deleteSession?.data as { sessionId: string })?.sessionId)
        }
      />
      <TableContainer className="mt-4" aria-busy={isPending || isFetching}>
        <Table className="min-w-3xl">
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
            {!isPending && isError && (
              <Tr>
                <Td colSpan={4}>
                  <div
                    className="flex flex-col items-center gap-3 px-4 py-8 text-center"
                    role="alert"
                  >
                    <FontAwesomeIcon
                      icon={faTriangleExclamation}
                      className="text-2xl text-danger"
                    />
                    <div>
                      <p className="font-medium text-mineshaft-100">Couldn&apos;t load sessions</p>
                      <p className="mt-1 text-sm text-bunker-300">
                        Check your connection and try again.
                      </p>
                    </div>
                    <Button
                      colorSchema="secondary"
                      leftIcon={<FontAwesomeIcon icon={faRotateRight} />}
                      isDisabled={isFetching}
                      isLoading={isFetching}
                      onClick={() => refetch()}
                    >
                      Try again
                    </Button>
                  </div>
                </Td>
              </Tr>
            )}
            {!isPending &&
              !isError &&
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
            {!isPending && !isError && data?.length === 0 && (
              <Tr>
                <Td colSpan={4}>
                  <EmptyState title="No sessions on file" icon={faServer} />
                </Td>
              </Tr>
            )}
            {!isPending && !isError && Boolean(data?.length) && filteredSessions.length === 0 && (
              <Tr>
                <Td colSpan={4}>
                  <EmptyState title="No sessions match this filter" icon={faServer}>
                    <p className="mt-1 text-sm text-bunker-400">
                      Clear the filter or try a different search term.
                    </p>
                  </EmptyState>
                </Td>
              </Tr>
            )}
          </TBody>
        </Table>
      </TableContainer>
    </>
  );
};
