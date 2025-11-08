import { useState } from "react";
import { ActionDisplayProps } from "../types";
import { DefaultAction } from "./default-action";
import { UserSelectAction, UserSelectActionProps } from "./action-user-select";

export function ActionDisplay(props: ActionDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 根据capability类型渲染不同的动作组件
  if (
    props.capability === "askUserToChoose" &&
    Array.isArray(props.params.options)
  ) {
    return <UserSelectAction {...(props as UserSelectActionProps)} />;
  }

  return (
    <DefaultAction
      {...props}
      isExpanded={isExpanded}
      onToggleExpand={() => setIsExpanded(!isExpanded)}
      debugInfo={{
        capability: props.capability,
        params: props.params,
        status: props.status,
        result: props.result?.result,
        error: props.error || props.result?.error,
      }}
    />
  );
}
