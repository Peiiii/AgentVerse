export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface ActionParams {
  options?: SelectOption[];
  multiple?: boolean;
  defaultValue?: string | string[];
  operationId: string;
  [key: string]: unknown;
}

export interface ActionResult<TResult = unknown> {
  status: "success" | "error";
  result?: TResult;
  error?: string;
}

export interface ActionDisplayProps<TResult = unknown> {
  capability: string;
  description: string;
  params: ActionParams;
  status?: "pending" | "running" | "success" | "error";
  result?: ActionResult<TResult>;
  error?: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

export interface SelectDisplayProps {
  options: SelectOption[];
  multiple?: boolean;
  defaultValue?: string | string[];
  disabled?: boolean;
  onSelect?: (selected: string | string[]) => void;
}

export interface ActionData {
  operationId: string;
  capability: string;
  description: string;
  params: ActionParams;
  await?: boolean;
  result?: ActionResult;
}

export interface MarkdownActionResults {
  [operationId: string]: ActionResult;
}

export interface ActionComponentProps {
  data: ActionData;
} 