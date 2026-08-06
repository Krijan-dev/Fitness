import { type TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full space-y-1.5">
        {label ? (
          <label htmlFor={inputId} className="block text-sm font-medium text-muted-foreground">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={inputId}
          className={`w-full min-h-[120px] rounded-xl border border-border bg-surface-elevated px-3.5 py-3 text-sm text-foreground placeholder:text-text-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${error ? "border-destructive" : ""} ${className}`}
          {...props}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
