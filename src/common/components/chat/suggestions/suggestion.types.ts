export interface Suggestion {
  id: string;
  type: 'question' | 'action' | 'link' | 'tool' | 'topic';
  title: string;
  description?: string;
  content: string;
  icon?: string;
  metadata?: Record<string, unknown>;
} 