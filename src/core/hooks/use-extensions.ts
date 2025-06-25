import { ExtensionDefinition } from "@cardos/extension";
import { useEffect, useState } from "react";
import { extensionManager } from "../extension-manager";

export const useExtensions = (extensions: ExtensionDefinition<unknown>[]) => {

    const [initialized, setInitialized] = useState(false);
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
        setInitialized(true);
    }, []);

    useEffect(() => {
        return () => {
            extensions.forEach((extension) => {
                extensionManager.deactivateExtension(extension.manifest.id);
            });
        }
    }, []);
    return {
        initialized,
    }
}