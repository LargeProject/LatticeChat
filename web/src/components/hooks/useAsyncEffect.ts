import { useEffect } from 'react';

export function useAsyncEffect(callback: () => Promise<void>, deps: any[] = []) {
  useEffect(() => {
    (async () => {
      await callback();
    })();
  }, deps);
}