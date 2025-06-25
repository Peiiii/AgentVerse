export interface Agent {
  id: string;
  name: string;
  avatar: string;
  prompt: string;
  role: 'moderator' | 'participant';
  personality: string;
  expertise: string[];
  bias: string;
  responseStyle: string;
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

