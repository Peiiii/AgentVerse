export interface ModalOptions {
  title?: string;
  description?: string;
  content?: React.ReactNode;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  afterClose?: () => void;
  okText?: string;
  cancelText?: string;
  className?: string;
  showFooter?: boolean;
}

export interface ModalState {
  isOpen: boolean;
  options: ModalOptions;
}

export interface ModalContextValue {
  show: (options: ModalOptions) => void;
  confirm: (options: Omit<ModalOptions, 'content'>) => void;
  close: () => void;
} 