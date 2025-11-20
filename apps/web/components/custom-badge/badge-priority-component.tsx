import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { TaskPriority } from "@/enums/task.enum";

type PriorityVariant = TaskPriority | "unknown";

const badgePriorityVariants = cva(
  "inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold capitalize shadow-sm transition-colors focus:outline-none text-primary-foreground", // Using text-primary-foreground for contrast on solid bg
  {
    variants: {
      priority: {
        [TaskPriority.LOW]: "bg-blue-100 text-blue-700  hover:bg-blue-200",
        [TaskPriority.MEDIUM]:
          "bg-amber-100 text-amber-700  hover:bg-amber-200",
        [TaskPriority.HIGH]:
          "bg-orange-100 text-orange-700  hover:bg-orange-200",
        [TaskPriority.CRITICAL]: "bg-red-100 text-red-700  hover:bg-red-200",
        unknown:
          "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200",
      },
    },
    defaultVariants: {
      priority: "unknown",
    },
  },
);

export interface BadgePriorityProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: TaskPriority | string;
}

const getPriorityVariant = (value: TaskPriority | string): PriorityVariant => {
  if (value === null || value === undefined) {
    return "unknown";
  }

  const lowerCaseValue = String(value).trim().toLowerCase();

  const validPriorities = Object.values(TaskPriority).map((p) =>
    p.toLowerCase(),
  );

  if (validPriorities.includes(lowerCaseValue)) {
    const matchedKey = Object.keys(TaskPriority).find(
      (key) =>
        TaskPriority[key as keyof typeof TaskPriority].toLowerCase() ===
        lowerCaseValue,
    );
    if (matchedKey) {
      return TaskPriority[matchedKey as keyof typeof TaskPriority];
    }
  }

  return "unknown";
};

const BadgePriority = React.forwardRef<HTMLDivElement, BadgePriorityProps>(
  ({ className, value, ...props }, ref) => {
    const determinedPriorityVariant = getPriorityVariant(value);

    const variantClasses = badgePriorityVariants({
      priority: determinedPriorityVariant,
    });

    const displayValue = String(value);

    return (
      <div className={cn(variantClasses, className)} ref={ref} {...props}>
        <span>{displayValue}</span>
      </div>
    );
  },
);

BadgePriority.displayName = "BadgePriority";

export { BadgePriority };
