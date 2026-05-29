import { useState, useRef, useCallback } from 'react';

export function useToast() {
  const [toast, setToast] = useState({ visible: false, msg: '' });
  const timer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast({ visible: true, msg });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }, []);

  return { toast, showToast };
}
