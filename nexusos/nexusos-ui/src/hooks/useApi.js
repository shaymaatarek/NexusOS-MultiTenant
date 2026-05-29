import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useApi — generic data-fetching hook
 *
 * @param {Function} apiFn   — async function that returns data (from apiService)
 * @param {Array}    deps    — re-fetch when these change (like useEffect deps)
 * @param {Object}   options — { immediate: bool (default true), initialData }
 *
 * Returns { data, loading, error, refetch, setData }
 *
 * Usage:
 *   const { data: users, loading, error, refetch } = useApi(apiGetUsers, [apiUrl]);
 */
export function useApi(apiFn, deps = [], { immediate = true, initialData = null } = {}) {
  const [data,    setData]    = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error,   setError]   = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn();
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current) setError(err.message || 'Unknown error');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) execute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute]);

  return { data, loading, error, refetch: execute, setData };
}

/**
 * useMutation — for create / update / delete operations
 *
 * Returns { mutate, loading, error }
 *
 * Usage:
 *   const { mutate: createUser, loading } = useMutation(apiCreateUser);
 *   await createUser({ name, email });   // throws on error
 */
export function useMutation(apiFn) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      return result;
    } catch (err) {
      const msg = err.message || 'Unknown error';
      setError(msg);
      throw err;                          // re-throw so caller can catch too
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  return { mutate, loading, error };
}
