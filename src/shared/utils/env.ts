import { envParseResult } from "@/env";

interface EnvIssue {
  name: string;
  expected: string;
  received?: string;
}

export const envIsValid = envParseResult.success;

export function getEnvIssues(): EnvIssue[] {
  if (envParseResult.success) return [];

  return envParseResult.error.issues.map((issue) => {
    const name = issue.path.length ? String(issue.path[0]) : "config";
    const received = (import.meta.env as Record<string, string | undefined>)[
      name
    ];

    return {
      name,
      expected: issue.message,
      received,
    };
  });
}
