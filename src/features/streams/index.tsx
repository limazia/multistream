import { useEffect } from "react";

import { FloatingControls, StreamGrid } from "./components";
import { useStreamUrlSync } from "./hooks/use-stream-url-sync";

export function StreamsPage() {
  const urlReady = useStreamUrlSync();

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      <StreamGrid ready={urlReady} />
      <FloatingControls />
    </div>
  );
}
