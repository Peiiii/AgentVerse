import { useCallback, useEffect } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

interface UseKeyboardExpandableListProps<T> {
  items: T[];
  selectedId: string | null;
  getItemId: (item: T) => string;
  onSelect: (id: string | null) => void;
  enabled?: boolean;
}

export function useKeyboardExpandableList<T>({
  items,
  selectedId,
  getItemId,
  onSelect,
  enabled = true
}: UseKeyboardExpandableListProps<T>) {
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled || !selectedId) return;
    
    const currentIndex = items.findIndex(item => getItemId(item) === selectedId);
    if (currentIndex === -1) return;

    switch (e.key) {
      case 'ArrowDown':
        if (currentIndex < items.length - 1) {
          onSelect(getItemId(items[currentIndex + 1]));
        }
        break;
      case 'ArrowUp':
        if (currentIndex > 0) {
          onSelect(getItemId(items[currentIndex - 1]));
        }
        break;
      case 'Escape':
        onSelect(null);
        break;
    }
  }, [enabled, items, selectedId, getItemId, onSelect]);

  const handleItemKeyDown = useCallback((e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(selectedId ? null : getItemId(items[Number(e.currentTarget.dataset.index)]));
    }
  }, [items, selectedId, getItemId, onSelect]);

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleGlobalKeyDown);
      return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }
  }, [enabled, handleGlobalKeyDown]);

  return {
    getItemProps: (index: number) => ({
      onKeyDown: handleItemKeyDown,
      'data-index': index,
      role: 'button',
      tabIndex: index + 1,
      'aria-expanded': getItemId(items[index]) === selectedId
    })
  };
} 