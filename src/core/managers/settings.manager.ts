import { RxEvent } from "@/common/lib/rx-event";

// Manager for Settings related UI actions.
// Exposes events and action functions (arrow functions only) to avoid `this` issues.
export class SettingsManager {
  readonly events = {
    open: new RxEvent<void>(),
  } as const;

  // Request opening the settings UI
  open = () => {
    this.events.open.next();
  };
}

