import { cn, STATUS_COLORS, LEAVE_TYPE_COLORS } from "@/lib/utils";

interface BadgeProps {
  value: string;
  type?: "status" | "leaveType" | "custom";
  className?: string;
}

export function Badge({ value, type = "status", className }: BadgeProps) {
  const colorMap = type === "leaveType" ? LEAVE_TYPE_COLORS : STATUS_COLORS;
  const color = colorMap[value] || "bg-gray-100 text-gray-700";

  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
      color,
      className
    )}>
      {value.replace("-", " ")}
    </span>
  );
}
