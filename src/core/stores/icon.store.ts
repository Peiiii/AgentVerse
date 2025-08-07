import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Bookmark,
  Bot,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Cog,
  Download,
  Edit,
  FileText,
  Folder,
  Github,
  Heart,
  HelpCircle,
  Home,
  Info,
  LogOut,
  Menu,
  MessageSquare,
  Minus,
  Monitor,
  Moon,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Search,
  Settings,
  Share,
  Star,
  Sun,
  Trash,
  Upload,
  User,
  Users,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { create } from "zustand";

export interface IconState {
  // 图标映射
  icons: Record<string, LucideIcon>;
  // 添加图标
  addIcon: (id: string, icon: LucideIcon) => () => void;
  addIcons: (icons: Record<string, LucideIcon>) => () => void;
  // 移除图标
  removeIcon: (id: string) => void;
  // 获取图标
  getIcon: (id: string) => LucideIcon | undefined;
  // 重置
  reset: () => void;
}

// 默认图标映射
const defaultIcons: Record<string, LucideIcon> = {
  // 基础图标
  message: MessageSquare,
  users: Users,
  settings: Settings,
  github: Github,
  home: Home,
  search: Search,
  file: FileText,
  folder: Folder,
  calendar: Calendar,
  star: Star,
  heart: Heart,
  bookmark: Bookmark,
  bot: Bot,

  // 操作图标
  download: Download,
  upload: Upload,
  share: Share,
  edit: Edit,
  trash: Trash,
  plus: Plus,
  minus: Minus,
  check: Check,
  x: X,

  // 导航图标
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-up": ChevronUp,
  "chevron-down": ChevronDown,
  menu: Menu,
  "more-horizontal": MoreHorizontal,
  "more-vertical": MoreVertical,

  // 主题图标
  sun: Sun,
  moon: Moon,
  monitor: Monitor,

  // 用户相关图标
  bell: Bell,
  user: User,
  "log-out": LogOut,
  cog: Cog,

  // 状态图标
  "help-circle": HelpCircle,
  info: Info,
  "alert-circle": AlertCircle,
  "alert-triangle": AlertTriangle,
  "check-circle": CheckCircle,
  "x-circle": XCircle,
};

export const useIconStore = create<IconState>()((set, get) => ({
  icons: defaultIcons,

  addIcon: (id: string, icon: LucideIcon) => {
    set((state) => ({
      icons: {
        ...state.icons,
        [id]: icon,
      },
    }));
    return () => {
      get().removeIcon(id);
    };
  },

  addIcons: (icons: Record<string, LucideIcon>) => {
    set((state) => {
      return {
        icons: {
          ...state.icons,
          ...icons,
        },
      };
    });
    return () => {
      Object.keys(icons).forEach((key) => {
        get().removeIcon(key);
      });
    };
  },

  removeIcon: (id: string) => {
    set((state) => {
      const newIcons = { ...state.icons };
      delete newIcons[id];
      return {
        icons: newIcons,
      };
    });
  },

  getIcon: (id: string) => {
    return get().icons[id];
  },

  reset: () => {
    set({
      icons: defaultIcons,
    });
  },
}));

export const useIcon = (id: string) => useIconStore((state) => state.icons[id]);
