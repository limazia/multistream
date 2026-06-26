import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  buildPathFromStreams,
  getPathSegments,
  parsePathSegments,
  streamsMatchPath,
} from "../lib/stream-path";

import { useStreamStore } from "./use-stream-store";

export function useStreamUrlSync() {
  const location = useLocation();
  const navigate = useNavigate();
  const streams = useStreamStore((state) => state.streams);
  const replaceStreamsFromUrls = useStreamStore(
    (state) => state.replaceStreamsFromUrls,
  );

  const [hydrated, setHydrated] = useState(
    () => useStreamStore.persist.hasHydrated(),
  );
  const [initialSyncDone, setInitialSyncDone] = useState(false);
  const skipNextUrlUpdate = useRef(false);

  useEffect(() => {
    const finishHydration = () => setHydrated(true);

    if (useStreamStore.persist.hasHydrated()) {
      finishHydration();
      return;
    }

    return useStreamStore.persist.onFinishHydration(finishHydration);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const pathSegments = getPathSegments(location.pathname);

    if (pathSegments.length === 0) {
      const currentStreams = useStreamStore.getState().streams;
      if (currentStreams.length > 0) {
        skipNextUrlUpdate.current = true;
        replaceStreamsFromUrls([]);
      }
      setInitialSyncDone(true);
      return;
    }

    const currentStreams = useStreamStore.getState().streams;
    if (streamsMatchPath(currentStreams, location.pathname)) {
      setInitialSyncDone(true);
      return;
    }

    const { urls } = parsePathSegments(pathSegments);
    skipNextUrlUpdate.current = true;
    replaceStreamsFromUrls(urls);
    setInitialSyncDone(true);
  }, [hydrated, location.pathname, replaceStreamsFromUrls]);

  useEffect(() => {
    if (!hydrated || !initialSyncDone) return;

    if (skipNextUrlUpdate.current) {
      skipNextUrlUpdate.current = false;
      return;
    }

    const targetPath = buildPathFromStreams(streams);
    if (location.pathname === targetPath) return;

    navigate(targetPath, { replace: true });
  }, [hydrated, initialSyncDone, location.pathname, navigate, streams]);

  return hydrated && initialSyncDone;
}
