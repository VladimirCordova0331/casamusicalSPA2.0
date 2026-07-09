import { useState, useCallback } from 'react';

export function useFormState<T extends Record<string, any>>(initial: T) {
  const [state, setState] = useState<T>(initial);

  const updateField = useCallback((field: keyof T, value: any) => {
    setState(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateMultiple = useCallback((updates: Partial<T>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => setState(initial), [initial]);

  return { state, updateField, updateMultiple, reset };
}
