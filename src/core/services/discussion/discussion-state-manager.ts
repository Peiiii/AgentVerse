import { DEFAULT_SETTINGS } from "@/config/settings";
import { BaseStateManager, BaseDiscussionState } from "./base-state-manager";
import { AgentMessage, DiscussionSettings } from "@/common/types/discussion";
import { DiscussionMember } from "@/common/types/discussion-member";
import { Observable } from "rxjs";

export interface DiscussionState extends BaseDiscussionState {
    messages: AgentMessage[];
    currentRound: number;
    currentSpeakerIndex: number;
    settings: DiscussionSettings;
    members: DiscussionMember[];
    topic: string;
}

export class DiscussionStateManager extends BaseStateManager<DiscussionState> {
    constructor() {
        super({
            messages: [],
            isPaused: true,
            currentDiscussionId: null,
            settings: DEFAULT_SETTINGS,
            currentRound: 0,
            currentSpeakerIndex: -1,
            members: [],
            topic: "",
        });
    }

    protected validateState(state: Partial<DiscussionState>): void {
        // 验证状态更新的合法性
        if (state.currentRound !== undefined && state.currentRound < 0) {
            throw new Error("回合数不能为负数");
        }
        if (state.currentSpeakerIndex !== undefined && state.currentSpeakerIndex < -1) {
            throw new Error("发言者索引不能小于-1");
        }
        if (state.members !== undefined && !Array.isArray(state.members)) {
            throw new Error("成员必须是数组");
        }
        if (state.messages !== undefined && !Array.isArray(state.messages)) {
            throw new Error("消息必须是数组");
        }
    }

    setMembers(members: DiscussionMember[]) {
        this.setState({ members });
    }

    setMessages(messages: AgentMessage[]) {
        this.setState({ messages });
    }

    setTopic(topic: string) {
        this.setState({ topic });
    }

    setSettings(settings: Partial<DiscussionSettings>) {
        this.setState({
            settings: {
                ...this.getState().settings,
                ...settings
            }
        });
    }

    incrementRound() {
        const currentRound = this.getState().currentRound;
        this.setState({ currentRound: currentRound + 1 });
    }

    setCurrentSpeakerIndex(index: number) {
        if (index >= -1 && index < this.getState().members.length) {
            this.setState({ currentSpeakerIndex: index });
        } else {
            throw new Error("发言者索引超出范围");
        }
    }

    getCurrentSpeaker(): DiscussionMember | null {
        const { currentSpeakerIndex, members } = this.getState();
        return currentSpeakerIndex >= 0 ? members[currentSpeakerIndex] : null;
    }

    getCurrentDiscussionId(): string | null {
        return this.getState().currentDiscussionId;
    }

    getCurrentDiscussionId$(): Observable<string | null> {
        return this.store.namespaces.currentDiscussionId.$;
    }

    resetDiscussionState() {
        this.setState({
            currentRound: 0,
            currentSpeakerIndex: -1,
            isPaused: true
        });
    }

    resetAllState() {
        this.setState({
            messages: [],
            isPaused: true,
            currentDiscussionId: null,
            settings: DEFAULT_SETTINGS,
            currentRound: 0,
            currentSpeakerIndex: -1,
            members: [],
            topic: "",
        });
    }
} 