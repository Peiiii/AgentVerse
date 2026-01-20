import {
  ActivityBarManager,
  IconManager,
  RouteTreeManager,
  NavigationManager,
  DiscussionsManager,
  AgentsManager,
  MessagesManager,
  DiscussionMembersManager,
  SettingsManager,
} from "@/core/managers";
import { DiscussionControlManager } from "@/core/managers/discussion-control.manager";

// Presenter only exposes managers.
export class Presenter {
  // managers
  readonly activityBar = new ActivityBarManager();
  readonly icon = new IconManager();
  readonly routeTree = new RouteTreeManager();
  readonly navigation = new NavigationManager();
  readonly discussions = new DiscussionsManager();
  readonly agents = new AgentsManager();
  readonly messages = new MessagesManager();
  readonly discussionMembers = new DiscussionMembersManager();
  readonly discussionControl = new DiscussionControlManager();
  readonly settings = new SettingsManager();

  constructor() {
    this.messages.init(this.discussionControl);
    this.discussionMembers.init(this.discussionControl);
  }
}

let singleton: Presenter | null = null;

export const getPresenter = () => {
  if (!singleton) singleton = new Presenter();
  return singleton;
};
