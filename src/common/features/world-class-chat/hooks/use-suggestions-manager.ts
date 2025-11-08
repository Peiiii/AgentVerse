import { useState, useCallback } from "react";
import type { Suggestion } from "@/common/features/chat/components/suggestions/suggestion.types";

export interface SuggestionsManager {
  suggestions: Suggestion[];
  setSuggestions: (suggestions: Suggestion[]) => void;
  addSuggestions: (suggestions: Suggestion[]) => void;
  addSuggestion: (suggestion: Suggestion) => void;
  removeSuggestion: (id: string) => void;
  clearSuggestions: () => void;
}

export function useSuggestionsManager(initialSuggestions: Suggestion[] = []): SuggestionsManager {
  const [suggestions, setSuggestionsState] = useState<Suggestion[]>(initialSuggestions);

  const setSuggestions = useCallback((newSuggestions: Suggestion[]) => {
    setSuggestionsState(newSuggestions);
  }, []);

  const addSuggestions = useCallback((newSuggestions: Suggestion[]) => {
    setSuggestionsState(prev => [...prev, ...newSuggestions]);
  }, []);

  const addSuggestion = useCallback((suggestion: Suggestion) => {
    setSuggestionsState(prev => [...prev, suggestion]);
  }, []);

  const removeSuggestion = useCallback((id: string) => {
    setSuggestionsState(prev => prev.filter(s => s.id !== id));
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestionsState([]);
  }, []);

  return {
    suggestions,
    setSuggestions,
    addSuggestions,
    addSuggestion,
    removeSuggestion,
    clearSuggestions,
  };
} 