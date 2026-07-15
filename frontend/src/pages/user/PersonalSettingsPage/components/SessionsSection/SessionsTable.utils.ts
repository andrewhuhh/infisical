import { TokenVersion } from "@app/hooks/api/users/types";
import { formatSessionUserAgent } from "@app/lib/fn/string";

export const filterSessions = (sessions: TokenVersion[], search: string) => {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return sessions;
  }

  return sessions.filter(({ id, ip, userAgent }) => {
    const { os, browser } = formatSessionUserAgent(userAgent);

    return [ip, id, os, browser].some((value) => value.toLowerCase().includes(normalizedSearch));
  });
};
