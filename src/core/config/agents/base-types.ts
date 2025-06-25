export interface Agent {
  id: string;
  name: string;
  avatar: string;
  prompt: string;
  role: "moderator" | "participant";
  personality: string;
  expertise: string[];
  bias: string;
  responseStyle: string;
}

export type AgentCombinationType = 
  | "thinkingTeam" 
  | "storyCreation" 
  | "startupIdeation" 
  | "creativeIdeation"
  | "productDevelopment"
  | "freeThinking"
  | "agentDesign"
  | "timeExploration"; 