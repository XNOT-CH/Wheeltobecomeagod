"use client";

import { useCallback, useEffect, useState } from "react";

export type Progress = Record<string, Record<string, boolean>>;

const STORE_KEY = "wheelGodProgress";

function readStore(): Progress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Progress) : {};
  } catch {
    return {};
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Reads localStorage after mount only — SSR has no window, and doing
    // this in an effect avoids a server/client markup mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(readStore());
    setHydrated(true);
  }, []);

  const markDone = useCallback((category: string, topic: string) => {
    setProgress((prev) => {
      const next: Progress = { ...prev, [category]: { ...prev[category], [topic]: true } };
      try {
        window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
      } catch {
        // ignore write failures (private mode, quota, etc.)
      }
      return next;
    });
  }, []);

  const isDone = useCallback(
    (category: string, topic: string) => Boolean(progress[category]?.[topic]),
    [progress],
  );

  return { progress, hydrated, markDone, isDone };
}
