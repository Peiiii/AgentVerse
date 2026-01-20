import { TooltipProvider } from "@/common/components/ui/tooltip.tsx";
import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.tsx";
import { AppLoading } from "@/common/features/app/components/app-loading";
import { ThemeProvider } from "@/common/components/common/theme/context";
import { ModalProvider } from "@/common/components/ui/modal/provider";
import { SettingsDialogBridge } from "@/common/features/settings/components/settings-dialog/settings-dialog-bridge";
import { ClientBreakpointProvider } from "@/common/components/common/client-breakpoint-provider";
import { PresenterProvider } from "@/core/presenter/presenter-context";
import "@/core/config/i18n";
import "./core/styles/theme.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<AppLoading />}>
      <TooltipProvider>
        <ThemeProvider>
          <ClientBreakpointProvider>
            <ModalProvider>
              <PresenterProvider>
                <SettingsDialogBridge />
                <App />
              </PresenterProvider>
            </ModalProvider>
          </ClientBreakpointProvider>
        </ThemeProvider>
      </TooltipProvider>
    </Suspense>
  </React.StrictMode>
);
