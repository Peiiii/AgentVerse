import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Github, 
  MessageSquare, 
  Settings, 
  Users, 
  Home,
  Search,
  FileText,
  Folder,
  Calendar,
  Star,
  Heart,
  Bookmark,
  Download,
  Upload,
  Share,
  Edit,
  Trash,
  Plus,
  Minus,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Menu,
  MoreHorizontal,
  MoreVertical,
  Sun,
  Moon,
  Monitor,
  Bell,
  User,
  LogOut,
  Cog,
  HelpCircle,
  Info,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bot,
  type LucideIcon
} from 'lucide-react';

export interface IconState {
  // 图标映射
  icons: Record<string, LucideIcon>;
  // 添加图标
  addIcon: (id: string, icon: LucideIcon) => void;
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
  'message': MessageSquare,
  'users': Users,
  'settings': Settings,
  'github': Github,
  'home': Home,
  'search': Search,
  'file': FileText,
  'folder': Folder,
  'calendar': Calendar,
  'star': Star,
  'heart': Heart,
  'bookmark': Bookmark,
  'bot': Bot,

  // 操作图标
  'download': Download,
  'upload': Upload,
  'share': Share,
  'edit': Edit,
  'trash': Trash,
  'plus': Plus,
  'minus': Minus,
  'check': Check,
  'x': X,

  // 导航图标
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'menu': Menu,
  'more-horizontal': MoreHorizontal,
  'more-vertical': MoreVertical,

  // 主题图标
  'sun': Sun,
  'moon': Moon,
  'monitor': Monitor,

  // 用户相关图标
  'bell': Bell,
  'user': User,
  'log-out': LogOut,
  'cog': Cog,

  // 状态图标
  'help-circle': HelpCircle,
  'info': Info,
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
};

export const useIconStore = create<IconState>()(
  persist(
    (set, get) => ({
      icons: defaultIcons,

      addIcon: (id: string, icon: LucideIcon) => {
        set((state) => ({
          icons: {
            ...state.icons,
            [id]: icon,
          },
        }));
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
    }),
    {
      name: 'icon-store',
      version: 1,
    }
  )
);

// 选择器hooks
export const useIcons = () => useIconStore((state) => state.icons);
export const useIcon = (id: string) => useIconStore((state) => state.icons[id]);
export const useIconIds = () => useIconStore((state) => Object.keys(state.icons)); 