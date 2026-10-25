import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../services/apiClient";

/**
 * Runs an async loader and tracks its result. Pass a stable loader (useCallback); a new loader triggers a new load.
 * @template T
 * @param {() => Promise<T>} loader
 * @returns {{ data: T | undefined, loading: boolean, error: string, reload: () => void }}
 */
export function useAsync(loader) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState({ loader: null, version: -1, data: undefined, error: "" });

  useEffect(() => {
    let active = true;
    loader().then(
      (data) => active && setResult({ loader, version, data, error: "" }),
      (err) => active && setResult({ loader, version, data: undefined, error: getErrorMessage(err) })
    );
    return () => { active = false; };
  }, [loader, version]);

  // Loading is derived rather than stored: the stored result belongs to an older loader until the new one settles
  const loading = result.loader !== loader || result.version !== version;
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { data: loading ? undefined : result.data, loading, error: loading ? "" : result.error, reload };
}
