import { DataProvider } from "@/common/lib/storage/types";
import { AgentDef } from "./agent";
import { Discussion } from "./discussion";
import { AgentMessage } from "./discussion";
import { DiscussionMember } from "@/common/types/discussion-member";

export type AgentDataProvider = DataProvider<AgentDef>;
export type DiscussionDataProvider = DataProvider<Discussion>;
export type MessageDataProvider = DataProvider<AgentMessage>; 
export type DiscussionMemberDataProvider = DataProvider<DiscussionMember>;
