import React, { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { ModalContext } from "./context";
import { ModalOptions, ModalState } from "./types";
import { cn } from "@/common/lib/utils";

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ModalState>({
    isOpen: false,
    options: {},
  });

  const close = useCallback(() => {
    setState(prev => {
      prev.options.afterClose?.();
      return { ...prev, isOpen: false };
    });
  }, []);

  const show = useCallback((options: ModalOptions) => {
    setState({
      isOpen: true,
      options,
    });
  }, []);

  const confirm = useCallback((options: Omit<ModalOptions, 'content'>) => {
    show({
      ...options,
      okText: options.okText ?? '确认',
      cancelText: options.cancelText ?? '取消',
    });
  }, [show]);

  const handleOk = async () => {
    try {
      await state.options.onOk?.();
      setState(prev => {
        prev.options.afterClose?.();
        return { ...prev, isOpen: false };
      });
    } catch (error) {
      console.error('Modal onOk error:', error);
    }
  };

  const handleCancel = () => {
    state.options.onCancel?.();
    setState(prev => {
      prev.options.afterClose?.();
      return { ...prev, isOpen: false };
    });
  };

  return (
    <ModalContext.Provider value={{ show, confirm, close }}>
      {children}
      <Dialog open={state.isOpen} onOpenChange={open => !open && handleCancel()}>
        <DialogContent className={cn(state.options.className)}>
          {state.options.title && (
            <DialogHeader>
              <DialogTitle>{state.options.title}</DialogTitle>
              {state.options.description && (
                <DialogDescription>{state.options.description}</DialogDescription>
              )}
            </DialogHeader>
          )}

          {state.options.content}

          {state.options.showFooter !== false && (
            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                {state.options.cancelText ?? '取消'}
              </Button>
              <Button onClick={handleOk}>
                {state.options.okText ?? '确认'}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </ModalContext.Provider>
  );
} 