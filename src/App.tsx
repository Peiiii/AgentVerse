import { DesktopApp } from "@/desktop/desktop-app";
import { MobileApp } from "@/mobile/mobile-app";
import { useBreakpointContext } from "@/common/components/common/breakpoint-provider";


export const App = () => {
  const { isMobile } = useBreakpointContext();
  return !isMobile ? <DesktopApp /> : <MobileApp />;
};