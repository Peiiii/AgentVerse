import { navigationStore } from "@/stores/navigation.store";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";


export const useConnectNavigationStore = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const targetPath = navigationStore((state) => state.targetPath);
    const currentPath = navigationStore((state) => state.currentPath);

    // 监听导航状态变化
    useEffect(() => {
        if (targetPath) {
            navigate(targetPath);
            navigationStore.getState().navigate(null);
        }
    }, [targetPath, navigate]);

    // 监听路由路径变化
    useEffect(() => {
        if (location.pathname !== currentPath) {
            navigationStore.getState().setCurrentPath(location.pathname);
        }
    }, [location.pathname, currentPath]);
};