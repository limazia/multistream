import { env } from "@/env";

export function getTwitchParents(): string[] {
  const parents = new Set<string>();
  const hostname = window.location.hostname;

  if (hostname) {
    parents.add(hostname);
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    parents.add("localhost");
    parents.add("127.0.0.1");
  }

  const fromEnv = env?.VITE_TWITCH_PARENT?.trim();
  if (fromEnv) {
    parents.add(fromEnv);
  }

  return [...parents];
}

export function appendTwitchParentParams(params: URLSearchParams): void {
  for (const parent of getTwitchParents()) {
    params.append("parent", parent);
  }
}
