import { ExtensionDefinition } from "@cardos/extension";
import { useEffect } from "react";
import { extensionManager } from "./extension-manager";

export const useExtensions = (extensions: ExtensionDefinition<any>[]) => {

    useEffect(() => {
        extensions.forEach((extension) => {
           if(!extensionManager.getExtension(extension.manifest.id)) {
            extensionManager.registerExtension(extension);
           }
        });
    }, []);
    

    useEffect(() => {
        extensions.forEach((extension) => {
            extensionManager.activateExtension(extension.manifest.id);
        });
    }, []);

    useEffect(() => {
        return () => {
            extensions.forEach((extension) => {
                extensionManager.deactivateExtension(extension.manifest.id);
            });
        }
    }, []);
}