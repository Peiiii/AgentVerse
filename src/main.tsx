import { TooltipProvider } from "@/common/components/ui/tooltip.tsx";
import {
  discussionMembersResource,
  discussionsResource,
  messagesResource,
} from "@/core/resources/index.ts";
import { discussionControlService } from "@/core/services/discussion-control.service.ts";
import { discussionMemberService } from "@/core/services/discussion-member.service.ts";
import { discussionService } from "@/core/services/discussion.service.ts";
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import { AppLoading } from "./common/components/app/app-loading.tsx";
import { ThemeProvider } from "./common/components/common/theme/context.tsx";
import { ModalProvider } from "./common/components/ui/modal/provider.tsx";
import { ClientBreakpointProvider } from "@/common/components/common/client-breakpoint-provider";
import { PresenterProvider } from "@/core/presenter/presenter-context";
import "./core/styles/theme.css";
import "./index.css";

window.discussionService = discussionService;
window.discussionControlService = discussionControlService;
window.discussionMemberService = discussionMemberService;
window.discussionsResource = discussionsResource;
window.discussionMembersResource = discussionMembersResource;
window.messagesResource = messagesResource;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<AppLoading />}>
      <TooltipProvider>
        <ThemeProvider>
          <ClientBreakpointProvider>
            <ModalProvider>
              <PresenterProvider>
                <App />
              </PresenterProvider>
            </ModalProvider>
          </ClientBreakpointProvider>
        </ThemeProvider>
      </TooltipProvider>
    </Suspense>
  </React.StrictMode>
);
