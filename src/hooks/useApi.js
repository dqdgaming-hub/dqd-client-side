import { useCallback, useEffect, useState } from "react";

/**
 * Load data whenever `key` changes.
 *
 * - Ignores out-of-order responses (a slow old request can't overwrite
 *   the result for the filters the user picked afterwards).
 * - Keeps the previous data visible while the next page/filter loads.
 *
 * const { data, error, loading, reload } = useApi(() => api.list(params), JSON.stringify(params));
 */
export default function useApi(fetcher, key) {
  const [tick, setTick] = useState(0);
  const requestKey = `${key}#${tick}`;
  const [state, setState] = useState({ key: null, data: undefined, error: null });

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(fetcher)
      .then(
        (data) => active && setState({ key: requestKey, data, error: null }),
        (error) => active && setState((prev) => ({ key: requestKey, data: prev.data, error })),
      );
    return () => {
      active = false;
    };
    // `fetcher` is recreated each render; `requestKey` captures its inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return {
    data: state.data,
    error: state.key === requestKey ? state.error : null,
    loading: state.key !== requestKey,
    reload,
  };
}
