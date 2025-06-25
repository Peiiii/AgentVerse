import { useConnectNavigationStore } from "@/core/hooks/use-connect-navigation-store";
import { useExtensions } from "@/core/hooks/use-extensions";
import { ExtensionDefinition } from "@cardos/extension";

export const useSetupApp = (options: {
    extensions: ExtensionDefinition[]
}) => {
    useExtensions(options.extensions);
    useConnectNavigationStore();
}