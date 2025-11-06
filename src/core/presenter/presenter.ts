import { ActivityBarManager, IconManager, RouteTreeManager, NavigationManager, DiscussionsManager, AgentsManager, MessagesManager, DiscussionMembersManager } from "@/core/managers";
import { discussionControlService } from "@/core/services/discussion-control.service";
import { RxEvent } from "@/common/lib/rx-event";

// Global Presenter aggregates all managers and cross-cutting capabilities
// All fields and functions are arrow functions or readonly properties to avoid 'this' issues.
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
  readonly discussionControl = discussionControlService;

  // simple app-wide event bus for cross-module communication when needed
  readonly events = {
    // Generic channel for string-keyed payloads
    app: new RxEvent<unknown>()
  } as const;

  // helper to emit on app channel
  emit = (value: unknown) => {
    this.events.app.next(value);
  };
}

let singleton: Presenter | null = null;

export const getPresenter = () => {
  if (!singleton) singleton = new Presenter();
  return singleton;
};
