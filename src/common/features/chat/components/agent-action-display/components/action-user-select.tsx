import { eventBus } from "@/core/env";
import { USER_SELECT } from "@/core/events";
import { ActionDisplayProps } from "../types";
import { SelectDisplay } from "./select-display";
import { StatusIcon } from "./status-icon";

export type UserSelectActionProps = Pick<
  ActionDisplayProps<{ selected: string | string[] }>,
  "description" | "params" | "status" | "result"
>;

export function UserSelectAction({
  description,
  params,
  status,
  result,
}: UserSelectActionProps) {
  const isPending = !status || status === "pending" || status === "running";
  const defaultValue = result?.result?.selected ?? (params.multiple ? params.defaultValue : undefined);

  const handleSelect = (selected: string | string[]) => {
    if (!isPending) return;
    eventBus.emit(USER_SELECT, {
      operationId: params.operationId,
      selected,
    });
  };

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-1">
          <StatusIcon status={status} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-gray-700 dark:text-gray-200 font-medium">
            {description}
          </div>
          <SelectDisplay
            options={params.options || []}
            multiple={!!params.multiple}
            defaultValue={defaultValue}
            disabled={!isPending}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </div>
  );
}
