import {
  ActivityBarManager,
  IconManager,
  RouteTreeManager,
  NavigationManager,
  DiscussionsManager,
  AgentsManager,
  MessagesManager,
  DiscussionMembersManager,
  DiscussionControlManager,
  SettingsManager,
} from "@/core/managers";

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
}

let singleton: Presenter | null = null;

export const getPresenter = () => {
  if (!singleton) singleton = new Presenter();
  return singleton;
};
