import { cn } from '@/lib/utils';
import { useIcon } from '@/stores/icon.store';
import { LucideIcon } from 'lucide-react';

interface IconRegistryProps {
    id?: string;
    className?: string;
    fallbackIcon?: LucideIcon;
}

export function IconRegistry({ id, className, fallbackIcon }: IconRegistryProps) {
    const icon = useIcon(id||"");

    // 如果找到了配置的图标，使用配置的图标
    if (icon) {
        const IconComponent = icon;
        return <IconComponent className={cn('w-4 h-4', className)} />;
    }

    // 如果提供了fallback图标，使用fallback
    if (fallbackIcon) {
        const FallbackIconComponent = fallbackIcon;
        return <FallbackIconComponent className={cn('w-4 h-4', className)} />;
    }

    // 如果都没有，返回null
    return null;
} 
