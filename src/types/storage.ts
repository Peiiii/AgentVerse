import { DataProvider } from "@/lib/storage/types";
import { Agent } from "./agent";
import { Discussion } from "./discussion";
import { AgentMessage } from "./discussion";
import { DiscussionMember } from "@/types/discussion-member";

export type AgentDataProvider = DataProvider<Agent>;
export type DiscussionDataProvider = DataProvider<Discussion>;
export type MessageDataProvider = DataProvider<AgentMessage>; 
export type DiscussionMemberDataProvider = DataProvider<DiscussionMember>;