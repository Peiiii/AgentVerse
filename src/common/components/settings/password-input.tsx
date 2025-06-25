import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PasswordInput({ value, onChange, placeholder }: PasswordInputProps) {
  const [isVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        type={isVisible ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10" // 为图标按钮留出空间
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
        // onClick={() => setIsVisible(!isVisible)}
        tabIndex={-1} // 防止 Tab 键聚焦
      >
        {isVisible ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="sr-only">
          {isVisible ? "隐藏密码" : "显示密码"}
        </span>
      </Button>
    </div>
  );
}

export default PasswordInput;