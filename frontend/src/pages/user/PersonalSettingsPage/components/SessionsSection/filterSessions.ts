import { formatSessionUserAgent } from "@app/lib/fn/string";

type TSearchableSession = {
  id: string;
  ip: string;
  userAgent: string;
};

export const filterSessions = <T extends TSearchableSession>(
  sessions: T[],
  search: string
): T[] => {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) return sessions;

  return sessions.filter(({ id, ip, userAgent }) => {
    const { os, browser } = formatSessionUserAgent(userAgent);

    return [ip, id, os, browser].some((value) => value.toLowerCase().includes(normalizedSearch));
  });
};
