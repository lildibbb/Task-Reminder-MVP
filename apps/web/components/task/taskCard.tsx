"use client";

import { Card, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  Clock,
  MessagesSquare,
  CheckCircle,
  AlertCircle,
  AlertOctagon,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { BadgeStatus } from "../custom-badge/badge-status-component";
import { BadgePriority } from "@/components/custom-badge/badge-priority-component";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate, getUserInitialsAndName } from "@/helpers/helper";
import { Label } from "@/components/ui/label";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { motion } from "framer-motion";

interface TaskCardProps {
  task: {
    name: string;
    email?: string;
    slug: string;
    assignee?: string;
    status: string;
    priority: string;
    dueDate?: string;
    id?: string;
    createdAt?: string;
    createdBy?: string;
    version?: string;
  };
  index?: number;
}

const getBorderColor = (priority: string, dueDate?: string) => {
  if (!dueDate) {
    switch (priority.toLowerCase()) {
      case "critical":
        return "border-l-red-500";
      case "high":
        return "border-l-orange-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-slate-300";
    }
  }

  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (priority.toLowerCase() === "critical" && diffDays <= 1) {
    return "border-l-red-600";
  }

  if (diffDays <= 3 && diffDays > 0) {
    return diffDays <= 1 ? "border-l-red-500" : "border-l-yellow-500";
  }

  if (diffDays < 0) {
    return "border-l-red-600";
  }

  switch (priority.toLowerCase()) {
    case "critical":
      return "border-l-red-500";
    case "high":
      return "border-l-orange-500";
    case "medium":
      return "border-l-green-500";
    case "low":
      return "border-l-emerald-500";
    default:
      return "border-l-slate-300";
  }
};

const getTaskIcon = (priority: string, dueDate?: string) => {
  let diffDays = Number.POSITIVE_INFINITY;
  if (dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  if (diffDays < 0) {
    return {
      icon: AlertTriangle,
      color: "text-red-500",
    };
  }

  if (priority.toLowerCase() === "critical" && diffDays <= 3) {
    return {
      icon: AlertTriangle,
      color: "text-red-500",
    };
  }

  switch (priority.toLowerCase()) {
    case "critical":
      return {
        icon: AlertCircle,
        color: "text-red-500",
      };
    case "high":
      return {
        icon: AlertOctagon,
        color: "text-orange-500",
      };
    case "medium":
      return {
        icon: Clock,
        color: "text-yellow-600",
      };
    case "low":
      return {
        icon: CheckCircle,
        color: "text-green-500",
      };
    default:
      return {
        icon: FileText,
        color: "text-primary",
      };
  }
};

const getBackgroundHint = (priority: string, dueDate?: string) => {
  let diffDays = Number.POSITIVE_INFINITY;
  if (dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  if (diffDays < 0) {
    return "bg-red-50 dark:bg-red-950/10";
  }

  if (priority.toLowerCase() === "critical" && diffDays <= 1) {
    return "bg-red-50 dark:bg-red-950/10";
  }

  switch (priority.toLowerCase()) {
    case "critical":
      return "bg-red-50/50 dark:bg-red-950/5";
    case "high":
      return "bg-orange-50/50 dark:bg-orange-950/5";
    case "medium":
      return "";
    case "low":
      return "";
    default:
      return "";
  }
};

export const TaskCard = ({ task, index = 0 }: TaskCardProps) => {
  const { initials } = getUserInitialsAndName({
    name: task.assignee,
    email: task.email || "",
  });

  const getDateUrgency = () => {
    if (!task.dueDate) return "normal";

    const now = new Date();
    const due = new Date(task.dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "overdue";
    if (diffDays <= 1) return "critical";
    if (diffDays <= 3) return "warning";
    return "normal";
  };

  const dateUrgency = getDateUrgency();

  const getDateStyling = () => {
    switch (dateUrgency) {
      case "overdue":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800";
      case "critical":
        return "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
    }
  };

  const borderColor = getBorderColor(task.priority, task.dueDate);
  const { icon: TaskIcon, color: iconColor } = getTaskIcon(
    task.priority,
    task.dueDate,
  );
  const backgroundHint = getBackgroundHint(task.priority, task.dueDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: "easeOut",
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
    >
      <Link
        href={`/task/${task.id}/${task.slug}`}
        className="transition-colors"
      >
        <Card
          className={`overflow-hidden border-l-4 ${borderColor} ${backgroundHint} transition-all hover:shadow-md`}
        >
          <div className="p-4">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <motion.div
                    whileHover={{ rotate: 15 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className={iconColor}
                  >
                    <TaskIcon className="h-5 w-5 flex-shrink-0" />
                  </motion.div>
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {task.name}
                  </CardTitle>
                </div>

                <div className="text-xs text-muted-foreground mt-1">
                  {task.id && <span className="font-medium">#{task.id}</span>}
                  {task.createdAt && (
                    <span> · created {formatDate(task.createdAt)}</span>
                  )}
                  {task.createdBy && <span> by {task.createdBy}</span>}
                </div>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <Avatar className="h-6 w-6 shrink-0 cursor-pointer">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex flex-col">
                      <Label className={"mb-2"}>Assignee</Label>
                      <p className="items-center">
                        {task.assignee || "Unassigned"}
                      </p>
                    </div>
                    <TooltipArrow className="fill-primary" />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex justify-between items-center mt-3">
              <motion.div
                className="flex flex-wrap gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <BadgeStatus value={task.status} />
                <BadgePriority value={task.priority} />
              </motion.div>

              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <motion.div
                  className="flex items-center gap-1.5"
                  whileHover={{ scale: 1.05 }}
                >
                  <MessagesSquare className="w-3.5 h-3.5" />
                  <span>1</span>
                </motion.div>
                {task.dueDate && (
                  <motion.div
                    className={`text-sm flex items-center gap-1 px-3 py-1 rounded-lg transition-all duration-200 ${getDateStyling()}`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {dateUrgency === "overdue" ? "Overdue" : "Due"}{" "}
                      {formatDate(task.dueDate)}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
};
