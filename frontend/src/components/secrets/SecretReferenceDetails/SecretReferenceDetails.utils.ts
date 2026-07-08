import { TSecretDependencyTreeNode, TSecretReferenceTraceNode } from "@app/hooks/api/types";

export type SecretReferenceListEntry = {
  key: string;
  secretPath: string;
  environments: string[];
  isDraft?: boolean;
};

type SecretReferenceMetadata = {
  environment: { name: string; slug: string };
  folders: {
    name: string;
    secrets?: { secretId: string; referencedSecretKey: string; referencedSecretEnv: string }[];
    isImported: boolean;
  }[];
}[];

const SECRET_REFERENCE_PATTERN = String.raw`\${([a-zA-Z0-9-_.@]+)}`;
const SECRET_REFERENCE_REG = new RegExp(SECRET_REFERENCE_PATTERN, "g");
const SECRET_REFERENCE_TEST_REG = new RegExp(SECRET_REFERENCE_PATTERN);

export const hasSecretReference = (value: string | undefined) =>
  value ? SECRET_REFERENCE_TEST_REG.test(value) : false;

export const getSecretReferenceState = ({
  secretKey,
  secretPath,
  value,
  importedBy,
  environment,
  visibleEnvironmentSlugs
}: {
  secretKey: string;
  secretPath: string;
  value?: string;
  importedBy?: SecretReferenceMetadata;
  environment?: string;
  visibleEnvironmentSlugs?: string[];
}) => {
  const visibleEnvironmentSet = new Set(
    visibleEnvironmentSlugs || (environment ? [environment] : [])
  );
  const isEnvironmentVisible = (slug: string) =>
    visibleEnvironmentSet.size === 0 || visibleEnvironmentSet.has(slug);

  const isConsumer =
    hasSecretReference(value) ||
    Boolean(
      importedBy?.some(({ environment: importedByEnvironment, folders }) =>
        isEnvironmentVisible(importedByEnvironment.slug)
          ? folders?.some(
              ({ name, secrets }) =>
                name === secretPath && secrets?.some(({ secretId }) => secretId === secretKey)
            )
          : false
      )
    );

  const isProvider = Boolean(
    importedBy?.some(({ folders }) =>
      folders?.some(({ secrets }) =>
        secrets?.some(
          ({ referencedSecretKey, referencedSecretEnv }) =>
            referencedSecretKey === secretKey && isEnvironmentVisible(referencedSecretEnv)
        )
      )
    )
  );

  return { isConsumer, isProvider };
};

export const formatReferenceEnvironmentList = (environments: string[]) => {
  const uniqueEnvironments = [...new Set(environments.filter(Boolean))];
  const environmentList = uniqueEnvironments.join(", ");

  if (uniqueEnvironments.length > 3 || environmentList.length > 18) {
    return String(uniqueEnvironments.length);
  }

  return environmentList;
};

export const parseSecretReferenceValue = (value: string) => {
  const parts: { type: "text" | "reference"; value: string }[] = [];
  let lastIndex = 0;

  value.replace(SECRET_REFERENCE_REG, (match, reference: string, offset: number) => {
    if (offset > lastIndex) {
      parts.push({ type: "text", value: value.slice(lastIndex, offset) });
    }

    parts.push({ type: "reference", value: reference });
    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < value.length) {
    parts.push({ type: "text", value: value.slice(lastIndex) });
  }

  return parts.length ? parts : [{ type: "text" as const, value }];
};

export const getIngestedSecretReferences = (
  tree?: TSecretReferenceTraceNode
): SecretReferenceListEntry[] => {
  if (!tree?.children?.length) return [];

  return tree.children.map((child) => ({
    key: child.key,
    secretPath: child.secretPath,
    environments: [child.environment]
  }));
};

const getReferenceSecretPath = (segments: string[], fallbackPath: string) => {
  if (!segments.length) return fallbackPath;
  return `/${segments.join("/")}`;
};

export const getDraftIngestedSecretReferences = ({
  value,
  environment,
  secretPath
}: {
  value: string;
  environment: string;
  secretPath: string;
}): SecretReferenceListEntry[] => {
  const entries = new Map<string, SecretReferenceListEntry>();

  parseSecretReferenceValue(value).forEach((part) => {
    if (part.type !== "reference") return;

    const segments = part.value.split(".").filter(Boolean);
    if (!segments.length) return;

    const isCrossProjectReference = segments[0].startsWith("@");
    const secretKey = segments[segments.length - 1];
    let referenceEnvironment = environment;
    let pathSegments: string[] = [];

    if (isCrossProjectReference) {
      referenceEnvironment = segments[1] || environment;
      pathSegments = segments.slice(2, -1);
    } else if (segments.length > 1) {
      [referenceEnvironment] = segments;
      pathSegments = segments.slice(1, -1);
    }

    const referencePath = getReferenceSecretPath(
      pathSegments,
      segments.length === 1 ? secretPath : "/"
    );
    const entryKey = `${referencePath}:${secretKey}`;
    const existing = entries.get(entryKey);

    if (existing) {
      existing.environments = [...new Set([...existing.environments, referenceEnvironment])];
      return;
    }

    entries.set(entryKey, {
      key: secretKey,
      secretPath: referencePath,
      environments: [referenceEnvironment],
      isDraft: true
    });
  });

  return [...entries.values()];
};

const addDependencyEntry = (
  entries: Map<string, SecretReferenceListEntry>,
  node: TSecretDependencyTreeNode
) => {
  const entryKey = `${node.secretPath}:${node.key}`;
  const existing = entries.get(entryKey);

  if (existing) {
    existing.environments = [...new Set([...existing.environments, node.environment])];
    return;
  }

  entries.set(entryKey, {
    key: node.key,
    secretPath: node.secretPath,
    environments: [node.environment]
  });
};

export const getUsedBySecretReferences = (
  tree?: TSecretDependencyTreeNode
): SecretReferenceListEntry[] => {
  if (!tree?.children?.length) return [];

  const entries = new Map<string, SecretReferenceListEntry>();
  const visit = (node: TSecretDependencyTreeNode) => {
    addDependencyEntry(entries, node);
    node.children?.forEach(visit);
  };

  tree.children.forEach(visit);
  return [...entries.values()];
};
