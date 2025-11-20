import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { TaskStatus } from "@/enums/task.enum";

type StatusVariant = TaskStatus | "unknown";

const badgeStatusVariants = cva(
  "inline-flex items-center rounded-full border border-transparent px-2 py-0.5 text-xs font-semibold capitalize shadow-none transition-colors focus:outline-none",
  {
    variants: {
      status: {
        [TaskStatus.NEW]:
          "bg-sky-600/10 text-sky-700 hover:bg-sky-600/15 dark:bg-sky-600/20 dark:text-sky-500",
        [TaskStatus.DOING]:
          "bg-amber-600/10 text-amber-700 hover:bg-amber-600/15 dark:bg-amber-600/20 dark:text-amber-500",
        [TaskStatus.PENDING_VERIFICATION]:
          "bg-orange-600/10 text-orange-700 hover:bg-orange-600/15 dark:bg-orange-600/20 dark:text-orange-500",
        [TaskStatus.VERIFICATION_FAILED]:
          "bg-red-600/10 text-red-700 hover:bg-red-600/15 dark:bg-red-600/20 dark:text-red-500",
        [TaskStatus.VERIFIED]:
          "bg-green-600/10 text-green-700 hover:bg-green-600/15 dark:bg-green-600/20 dark:text-green-500",
        [TaskStatus.CLOSED]:
          "bg-slate-600/10 text-slate-700 hover:bg-slate-600/15 dark:bg-slate-600/20 dark:text-slate-500",
        unknown:
          "bg-slate-500/10 text-slate-600 hover:bg-slate-500/15 dark:bg-slate-500/20 dark:text-slate-400",
      },
    },
  },
);

const dotColorMap: Record<StatusVariant, string> = {
  [TaskStatus.NEW]: "bg-sky-600",
  [TaskStatus.DOING]: "bg-amber-600",
  [TaskStatus.PENDING_VERIFICATION]: "bg-orange-600",
  [TaskStatus.VERIFICATION_FAILED]: "bg-red-600",
  [TaskStatus.VERIFIED]: "bg-green-600",
  [TaskStatus.CLOSED]: "bg-slate-600",
  unknown: "bg-slate-500",
};

export interface BadgeStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  value: TaskStatus | string;
}

const getStatusVariant = (value: TaskStatus | string): StatusVariant => {
  if (value === null || value === undefined) {
    return "unknown";
  }
  const lowerCaseValue = String(value).trim().toLowerCase();
  if (Object.values(TaskStatus).includes(lowerCaseValue as TaskStatus)) {
    return lowerCaseValue as TaskStatus;
  }
  return "unknown";
};

const BadgeStatus = React.forwardRef<HTMLDivElement, BadgeStatusProps>(
  ({ className, value, ...props }, ref) => {
    const determinedStatusVariant = getStatusVariant(value);
    const variantClasses = badgeStatusVariants({
      status: determinedStatusVariant,
    });

    const dotClass =
      dotColorMap[determinedStatusVariant] || dotColorMap["unknown"];
    const displayValue = String(value).replace(/_/g, " ");

    return (
      <div className={cn(variantClasses, className)} ref={ref} {...props}>
        <span
          className={cn("mr-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dotClass)}
          aria-hidden="true"
        />
        <span>{displayValue}</span>
      </div>
    );
  },
);

BadgeStatus.displayName = "BadgeStatus";

export { BadgeStatus };
