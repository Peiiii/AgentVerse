import { DesktopApp } from "@/app/desktop-app";
import { MobileApp } from "@/app/mobile-app";
import { useBreakpointContext } from "@/components/common/breakpoint-provider";


export const App = () => {
  const { isDesktop } = useBreakpointContext();
  return isDesktop ? <DesktopApp /> : <MobileApp />;
};