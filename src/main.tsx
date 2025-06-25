/* eslint-disable @typescript-eslint/no-explicit-any */
import { BreakpointProvider } from "@/common/components/common/breakpoint-provider.tsx";
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
import "./core/styles/theme.css";
import "./index.css";

(window as any).discussionService = discussionService;
(window as any).discussionControlService = discussionControlService;
(window as any).discussionMemberService = discussionMemberService;
(window as any).discussionsResource = discussionsResource;
(window as any).discussionMembersResource = discussionMembersResource;
(window as any).messagesResource = messagesResource;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<AppLoading />}>
      <TooltipProvider>
        <BreakpointProvider>
          <ThemeProvider>
            <ModalProvider>
              <App />
            </ModalProvider>
          </ThemeProvider>
        </BreakpointProvider>
      </TooltipProvider>
    </Suspense>
  </React.StrictMode>
);
