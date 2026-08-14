"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("cancel", handleCancel);
    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("cancel", handleCancel);
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className={`fixed inset-x-0 bottom-0 z-50 m-0 w-full max-h-[min(92dvh,100%)] overflow-hidden rounded-t-2xl border border-border bg-card p-0 text-foreground shadow-xl open:flex open:flex-col sm:inset-auto sm:m-auto sm:max-w-[calc(100%-2rem)] sm:rounded-xl ${sizeStyles[size]} backdrop:bg-black/60`}
      aria-labelledby="modal-title"
    >
      <div className="flex items-start justify-between border-b border-border p-4 sm:p-5">
        <div>
          <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close modal"
          className="h-11 w-11 shrink-0 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="overflow-y-auto p-4 sm:p-5">{children}</div>
    </dialog>
  );
}
