interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showValues?: boolean;
  color?: "primary" | "success" | "warning";
  className?: string;
}

const colorStyles = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
};

export function ProgressBar({
  value,
  max,
  label,
  showValues = true,
  color = "primary",
  className = "",
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className={className}>
      {(label || showValues) && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          {label ? <span className="text-muted-foreground">{label}</span> : <span />}
          {showValues ? (
            <span className="font-medium text-foreground">
              {Math.round(value)} / {Math.round(max)}
            </span>
          ) : null}
        </div>
      )}
      <div
        className="h-2 w-full rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorStyles[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
