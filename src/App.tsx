import { DesktopApp } from "@/app/desktop-app";
import { MobileApp } from "@/app/mobile-app";
import { useBreakpointContext } from "@/common/components/common/breakpoint-provider";


export const App = () => {
  const { isDesktop } = useBreakpointContext();
  return isDesktop ? <DesktopApp /> : <MobileApp />;
};