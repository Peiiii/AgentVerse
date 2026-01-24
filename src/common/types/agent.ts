export interface AgentDef {
  id: string;
  // Stable identifier for built-in agents; optional for user-created ones
  slug?: string;
  // Definition version for built-in agents; optional
  version?: number;
  name: string;
  avatar: string;
  prompt: string;
  role: 'moderator' | 'participant';
  personality: string;
  expertise: string[];
  bias: string;
  responseStyle: string;
  tags?: string[];
}

export interface CombinationParticipant {
  name: string;
  description?: string;
}

export interface AgentCombination {
  name: string;
  description: string;
  moderator: CombinationParticipant;
  participants: CombinationParticipant[];
}
