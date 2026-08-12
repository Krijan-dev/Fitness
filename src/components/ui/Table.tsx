import { type ReactNode } from "react";

interface TableProps {
  headers: string[];
  children: ReactNode;
  className?: string;
}

export function Table({ headers, children, className = "" }: TableProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-border bg-card ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-elevated/60 text-muted-foreground">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-medium whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function TableRow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr className={`border-b border-border/70 last:border-0 hover:bg-surface-hover/40 ${className}`}>
      {children}
    </tr>
  );
}

export function TableCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}
