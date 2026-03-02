"use client";

import { useState, useEffect } from "react";

interface CutoffStatus {
  locked: boolean;
  cutoffAt: string | null;
  label: string | null;
}

export function useCutoffStatus() {
  const [status, setStatus] = useState<CutoffStatus>({ locked: false, cutoffAt: null, label: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cutoff/status")
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus({ locked: false, cutoffAt: null, label: null }))
      .finally(() => setLoading(false));
  }, []);

  return { ...status, loading };
}
