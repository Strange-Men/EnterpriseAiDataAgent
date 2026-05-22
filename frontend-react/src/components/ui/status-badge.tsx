import { cn } from "@/utils/cn";

interface StatusBadgeProps {
  status: "ok" | "error" | "warning" | "unknown";
  label: string;
}

const statusStyles = {
  ok: "text-green-400",
  error: "text-red-400",
  warning: "text-yellow-400",
  unknown: "text-yellow-400",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span className={cn("text-sm", statusStyles[status])}>
      <span className="inline-block w-2 h-2 rounded-full bg-current mr-1.5 align-middle" />
      {label}
    </span>
  );
}
