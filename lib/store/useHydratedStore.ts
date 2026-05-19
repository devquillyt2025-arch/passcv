import { useState, useEffect } from 'react';

/**
 * Custom hook to safely access Zustand stores that use `persist` middleware.
 * This completely eliminates Next.js hydration mismatch errors by deferring
 * the return of the store data until after the component has mounted on the client.
 * 
 * @param store - The Zustand store hook
 * @param selector - The selector function to pick state
 * @returns The selected state, or undefined if not yet hydrated
 */
export function useHydratedStore<T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  selector: (state: T) => F
): F | undefined {
  const result = store(selector) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
}
