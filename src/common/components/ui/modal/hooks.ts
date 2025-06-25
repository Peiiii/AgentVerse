import { useModalContext } from './context';
import { ModalOptions } from './types';

export function useModal() {
  const context = useModalContext();

  const showModal = (options: ModalOptions) => {
    context.show(options);
  };

  const confirmModal = (options: Omit<ModalOptions, 'content'>) => {
    context.confirm(options);
  };

  const closeModal = () => {
    context.close();
  };

  return {
    show: showModal,
    confirm: confirmModal,
    close: closeModal,
  };
} 