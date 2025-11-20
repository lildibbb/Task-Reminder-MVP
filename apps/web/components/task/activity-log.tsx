"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Reply,
  XCircle,
} from "lucide-react";
import EditorClient from "@/components/react-tiptap/editor-client";
import { convertJsonToHtml } from "@/lib/json-to-html";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatTimestamp } from "@/helpers/helper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { Activity } from "@/types/task.types";
import { BadgeStatus } from "@/components/custom-badge/badge-status-component";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCommentForm } from "@/hooks/useCommentForm";
import { TaskStatus } from "@/enums/task.enum";
import APIService from "@/api/apiService";
import { UserAPI } from "@/api/user";

interface ActivityLogProps {
  activities: Activity[];
  userInitials: string;
  onRefreshData: () => void;
  onAddCompletionReport?: (comment: any) => void;
  onResolveCompletionReport?: (reportId: string, isApproved: boolean) => void;
  canSubmitCompletion?: boolean;
  canVerify?: boolean;
  currentUserId?: string | null;
  currentUser: any;
  setTaskData: any;
  taskID: string;
}

// Optimistic ID generator using negative numbers to avoid conflicts
const generateOptimisticId = (() => {
  let counter = -1;
  return () => counter--;
})();

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const editorVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    height: "auto",
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

const badgeVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

const buttonVariants = {
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
  tap: { scale: 0.98 },
};

export const ActivityLog = ({
  activities,
  userInitials,
  onRefreshData,
  onAddCompletionReport,
  onResolveCompletionReport,
  canSubmitCompletion = false,
  canVerify = false,
  currentUserId,
  currentUser,
  setTaskData,
  taskID,
}: ActivityLogProps) => {
  const [showCommentEditor, setShowCommentEditor] = useState<boolean>(false);
  const [showCompletionEditor, setShowCompletionEditor] =
    useState<boolean>(false);
  const [replyToComment, setReplyToComment] = useState<string | null>(null);
  const [activeReplyIndex, setActiveReplyIndex] = useState<number>(-1);
  const [activeParentIndex, setActiveParentIndex] = useState<number>(-1);
  const [collapsedThreads, setCollapsedThreads] = useState<
    Record<string, boolean>
  >({});

  const mainCommentForm = useCommentForm(
    {},
    onRefreshData,
    undefined,
    activities,
    false,
  );

  const completionForm = useCommentForm(
    {},
    onRefreshData,
    undefined,
    activities,
    true,
  );

  const replyForm = useCommentForm(
    {},
    onRefreshData,
    undefined,
    activities,
    false,
  );

  // Helper functions
  const resetEditorStates = () => {
    setShowCommentEditor(false);
    setShowCompletionEditor(false);
    setReplyToComment(null);
    setActiveReplyIndex(-1);
    setActiveParentIndex(-1);
  };

  const createOptimisticActivity = (
    type: Activity["type"],
    content?: any,
    action?: string,
    target?: any,
  ): Activity => ({
    id: generateOptimisticId().toString(),
    type,
    user: currentUser?.name || "Current User",
    username: `@${currentUser?.username || currentUser?.email?.split("@")[0] || "currentuser"}`,
    time: new Date().toISOString(),
    content,
    action,
    target,
    replies: [],
  });

  const updateTaskDataOptimistically = (
    updater: (prev: any) => any,
    rollback?: () => void,
  ) => {
    const previousData = setTaskData((prev: any) => {
      if (!prev) return prev;
      return updater(prev);
    });

    return {
      rollback: () => {
        if (rollback) rollback();
        onRefreshData();
      },
    };
  };

  const toggleCommentEditor = () => {
    setShowCommentEditor((prev) => !prev);
    setShowCompletionEditor(false);
    if (showCommentEditor) {
      mainCommentForm.form.reset();
    }
  };

  const toggleCompletionEditor = () => {
    setShowCompletionEditor((prev) => !prev);
    setShowCommentEditor(false);
    if (showCompletionEditor) {
      completionForm.form.reset();
    }
  };

  const toggleReplyEditor = (
    commentId: string,
    index: number,
    parentIndex = -1,
  ) => {
    if (replyToComment === commentId) {
      setReplyToComment(null);
      setActiveReplyIndex(-1);
      setActiveParentIndex(-1);
      replyForm.form.reset();
    } else {
      setReplyToComment(commentId);
      setActiveReplyIndex(index);
      setActiveParentIndex(parentIndex);

      if (parentIndex >= 0 && activities[parentIndex]?.id) {
        replyForm.form.setValue(
          "parent_comment_id",
          activities[parentIndex].id,
        );
      }
    }
  };

  const toggleThreadCollapse = (threadId: string) => {
    setCollapsedThreads((prev) => ({
      ...prev,
      [threadId]: !prev[threadId],
    }));
  };

  const handleAddComment = async (data: any) => {
    const { rollback } = updateTaskDataOptimistically((prev) => {
      const newComment = createOptimisticActivity(
        "comment",
        data.comment_content,
      );
      return {
        ...prev,
        activities: [...prev.activities, newComment],
      };
    });

    try {
      await mainCommentForm.onSubmit(data, undefined, {
        triggerSuccessCallback: false,
      });
      resetEditorStates();
      mainCommentForm.form.reset();
    } catch (err) {
      console.error(err);
      rollback();
    }
  };

  const handleAddCompletionReport = async (data: any) => {
    const { rollback } = updateTaskDataOptimistically((prev) => {
      const newCompletionReport = createOptimisticActivity(
        "completion_report",
        data.comment_content,
      );
      const statusChange = createOptimisticActivity(
        "status",
        undefined,
        "changed status",
        TaskStatus.PENDING_VERIFICATION,
      );

      return {
        ...prev,
        status: TaskStatus.PENDING_VERIFICATION,
        activities: [...prev.activities, newCompletionReport, statusChange],
      };
    });

    try {
      await completionForm.onSubmit(data);
      if (onAddCompletionReport) {
        onAddCompletionReport(data.comment_content);
      }
      resetEditorStates();
      completionForm.form.reset();
    } catch (error) {
      console.error("Completion report submission failed:", error);
      rollback();
    }
  };

  const handleAddReply = async (data: any) => {
    if (activeParentIndex < 0) return;

    const parentActivity = activities[activeParentIndex];
    const isCompletionReport = parentActivity?.type === "completion_report";
    const isVerifier = canVerify && currentUser?.name !== parentActivity?.user;

    if (isCompletionReport && isVerifier && !parentActivity?.isResolved) {
      const { rollback } = updateTaskDataOptimistically((prev) => {
        const newReply = createOptimisticActivity(
          "comment",
          data.comment_content,
        );
        const resolveActivity = createOptimisticActivity(
          "completion_report_resolution",
          undefined,
          "rejected completion report",
          parentActivity.id,
        );
        const statusChange = createOptimisticActivity(
          "status",
          undefined,
          "changed status",
          TaskStatus.VERIFICATION_FAILED,
        );

        const updatedActivities = prev.activities.map((activity: Activity) => {
          if (activity.id === parentActivity.id) {
            return {
              ...activity,
              isResolved: true,
              resolution: "rejected" as const,
              replies: [...(activity.replies || []), newReply],
            };
          }
          return activity;
        });

        return {
          ...prev,
          status: TaskStatus.VERIFICATION_FAILED,
          activities: [...updatedActivities, resolveActivity, statusChange],
        };
      });

      try {
        await Promise.all([
          replyForm.onSubmit(data, activeParentIndex, {
            triggerSuccessCallback: false,
          }),
          APIService.patch(UserAPI.task.update.replace("{taskId}", taskID), {
            status: TaskStatus.VERIFICATION_FAILED,
            resolvedReportId: parentActivity.id,
          }),
        ]);
      } catch (error) {
        console.error("Reply submission failed:", error);
        rollback();
      }
    } else {
      try {
        await replyForm.onSubmit(data, activeParentIndex, {
          triggerSuccessCallback: false,
        });
      } catch (error) {
        console.error("Reply submission failed:", error);
        onRefreshData();
      }
    }

    resetEditorStates();
    replyForm.form.reset();
  };

  const hasVerifierComments = (report: Activity) => {
    return report.replies?.some((reply) => reply.user !== report.user);
  };

  const handleApproveCompletionReport = async (reportId: string) => {
    const completionReport = activities.find(
      (activity) =>
        activity.id === reportId && activity.type === "completion_report",
    );

    if (!completionReport) return;

    const hasComments = hasVerifierComments(completionReport);
    const finalAction = hasComments ? "rejected" : "approved";
    const finalStatus = hasComments
      ? TaskStatus.VERIFICATION_FAILED
      : TaskStatus.VERIFIED;

    const { rollback } = updateTaskDataOptimistically((prev) => {
      const resolveActivity = createOptimisticActivity(
        "completion_report_resolution",
        undefined,
        `${finalAction} completion report`,
        reportId,
      );
      const statusChange = createOptimisticActivity(
        "status",
        undefined,
        "changed status",
        finalStatus,
      );

      const updatedActivities = prev.activities.map((activity: Activity) => {
        if (activity.id === reportId && activity.type === "completion_report") {
          return {
            ...activity,
            isResolved: true,
            resolution: finalAction as "approved" | "rejected",
          };
        }
        return activity;
      });

      return {
        ...prev,
        status: finalStatus,
        activities: [...updatedActivities, resolveActivity, statusChange],
      };
    });

    try {
      await APIService.patch(UserAPI.task.update.replace("{taskId}", taskID), {
        status: finalStatus,
        resolvedReportId: reportId,
      });
    } catch (error) {
      console.error("Failed to resolve completion report:", error);
      rollback();
    }
  };

  // Render helper functions
  const getCommentId = (index: number, parentId = "") => {
    return `comment-${parentId}-${index}`;
  };

  const getThreadId = (activityId: string) => {
    return `thread-${activityId}`;
  };

  const getUserInitials = (user: string) => {
    return user
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const CommentTimelineDot = ({ initials }: { initials: string }) => (
    <motion.div
      className="flex items-center justify-center"
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Avatar className="h-7 w-7">
        <AvatarFallback className="bg-blue-500 h-full w-full flex items-center justify-center text-white text-xs font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
    </motion.div>
  );

  const CompletionReportTimelineDot = ({ initials }: { initials: string }) => (
    <motion.div
      className="flex items-center justify-center"
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Avatar className="h-7 w-7">
        <AvatarFallback className="bg-orange-500 h-full w-full flex items-center justify-center text-white text-xs font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
    </motion.div>
  );

  const renderReplyEditor = (
    isOpen: boolean,
    onSubmit: (data: any) => void,
    onCancel: () => void,
  ) => {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mt-3 mb-4"
            variants={editorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="rounded-lg p-3">
              <Form {...replyForm.form}>
                <form
                  onSubmit={replyForm.form.handleSubmit(onSubmit)}
                  className="space-y-2"
                >
                  <FormField
                    control={replyForm.form.control}
                    name="comment_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <EditorClient
                            value={field.value!}
                            onChange={(content) => {
                              field.onChange(content);
                              replyForm.handleEditorChange(content);
                            }}
                            onFileUpload={replyForm.handleFileUpload}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <motion.div
                    className="flex justify-end gap-2 mt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.div
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onCancel}
                      >
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        type="submit"
                        size="sm"
                        disabled={replyForm.loading}
                      >
                        {replyForm.loading ? (
                          <motion.span
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 1.5,
                            }}
                          >
                            Replying...
                          </motion.span>
                        ) : (
                          "Reply"
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>
              </Form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderComment = (
    comment: Activity,
    index: number,
    isReply = false,
    parentIndex = -1,
  ) => {
    const commentId = getCommentId(
      index,
      isReply ? `reply-${parentIndex}` : "",
    );
    const isReplyOpen = replyToComment === commentId;
    const initials = getUserInitials(comment.user);

    return (
      <motion.div
        className="border rounded-lg p-3 sm:p-4 mb-3"
        key={commentId}
        variants={itemVariants}
        whileHover={{
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          transition: { duration: 0.2 },
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-blue-500 h-full w-full flex items-center justify-center text-white text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div>
              <span className="font-semibold">{comment.user}</span>
              <span className="text-xs text-gray-500 ml-2">
                {comment.username}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                {formatTimestamp(comment.time)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-7 w-7"
                onClick={() =>
                  toggleReplyEditor(
                    commentId,
                    index,
                    isReply ? parentIndex : index,
                  )
                }
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button variant="ghost" size="sm" className="p-1 h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="prose max-w-none dark:prose-invert text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: convertJsonToHtml(comment.content),
            }}
          />
        </motion.div>

        {renderReplyEditor(isReplyOpen, handleAddReply, () =>
          toggleReplyEditor(commentId, index, parentIndex),
        )}
      </motion.div>
    );
  };

  const renderCompletionReport = (report: Activity, index: number) => {
    const initials = getUserInitials(report.user);
    const isResolved = report.isResolved;
    const resolution = report.resolution;
    const hasComments = hasVerifierComments(report);
    const completionReportCommentId = `completion-comment-${index}`;
    const isCompletionReplyOpen = replyToComment === completionReportCommentId;
    const threadId = getThreadId(report.id);
    const hasReplies = report.replies && report.replies.length > 0;
    const isCollapsed = collapsedThreads[threadId];

    return (
      <motion.div
        className={`border-2 rounded-lg p-3 sm:p-4 mb-3 ${
          isResolved
            ? resolution === "approved"
              ? "border-green-200 bg-green-50 dark:bg-green-900/20"
              : "border-red-200 bg-red-50 dark:bg-red-900/20"
            : "border-orange-200 bg-orange-50 dark:bg-orange-900/20"
        }`}
        key={`completion-${index}`}
        variants={itemVariants}
        whileHover={{
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
          transition: { duration: 0.3 },
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-orange-500 h-full w-full flex items-center justify-center text-white text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{report.user}</span>
                <motion.div
                  variants={badgeVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                >
                  <Badge
                    variant="outline"
                    className="bg-orange-100 text-orange-800"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Completion Report
                  </Badge>
                </motion.div>
                {isResolved && (
                  <motion.div
                    variants={badgeVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                  >
                    <Badge
                      variant="outline"
                      className={
                        resolution === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {resolution === "approved" ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejected
                        </>
                      )}
                    </Badge>
                  </motion.div>
                )}
              </div>
              <div className="text-xs text-gray-500">
                <span>{report.username}</span>
                <span className="ml-2">{formatTimestamp(report.time)}</span>
              </div>
            </div>
          </div>
        </div>

        {!isResolved && canVerify && (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Button
                variant="default"
                size="sm"
                onClick={() => handleApproveCompletionReport(report.id)}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
            </motion.div>
          </motion.div>
        )}
        <motion.div
          className="prose max-w-none dark:prose-invert text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: convertJsonToHtml(report.content),
            }}
          />
        </motion.div>

        {canVerify && !isResolved && hasComments && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Alert className="mt-3 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>Note:</strong> Adding comments to this completion report
                will automatically fail the verification when you try to approve
                it.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Collapsible replies section */}
        {hasReplies && (
          <>
            <motion.div
              className="flex items-center mt-4 mb-2 text-sm text-gray-600 dark:text-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                onClick={() => toggleThreadCollapse(threadId)}
                className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-100 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  animate={{ rotate: isCollapsed ? 0 : -90 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center"
                >
                  <Reply className="h-3 w-3 mr-1" />
                </motion.div>
                <span className="text-sm">
                  {isCollapsed ? (
                    <span className="flex items-center">
                      Expand discussion ({report.replies?.length})
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Collapse discussion
                    </span>
                  )}
                </span>
              </motion.button>
            </motion.div>

            <AnimatePresence initial={false} mode="wait">
              {!isCollapsed && (
                <motion.div
                  className="space-y-2"
                  key={`thread-content-${threadId}`}
                  id={`thread-content-${threadId}`}
                  initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                  animate={{ opacity: 1, height: "auto", overflow: "visible" }}
                  exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                >
                  {report.replies?.map((reply, replyIndex) => (
                    <motion.div
                      key={`completion-reply-${report.id}-${reply.id}-${replyIndex}`}
                      className="ml-4"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * replyIndex, duration: 0.3 }}
                    >
                      {renderComment(reply, replyIndex, true, index)}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Add comment field for completion report */}
        {!isResolved && (
          <motion.div
            className="mt-4 pt-4 border-t border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {isCompletionReplyOpen ? (
              renderReplyEditor(true, handleAddReply, () => {
                setReplyToComment(null);
                setActiveReplyIndex(-1);
                setActiveParentIndex(-1);
                replyForm.form.reset();
              })
            ) : (
              <motion.div
                className="border rounded-lg p-3 w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-transparent"
                onClick={() => {
                  setReplyToComment(completionReportCommentId);
                  setActiveReplyIndex(-1);
                  setActiveParentIndex(index);
                  replyForm.form.setValue("parent_comment_id", report.id);
                }}
                whileHover={{
                  scale: 1.01,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
                whileTap={{ scale: 0.99 }}
              >
                <p className="text-gray-500 text-sm">Add a comment...</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    );
  };

  const renderMainActivity = (activity: Activity, index: number) => {
    const threadId = getThreadId(activity.id);
    const hasReplies = activity.replies && activity.replies.length > 0;
    const isCollapsed = collapsedThreads[threadId];

    if (activity.type === "completion_report") {
      return (
        <motion.div
          key={`activity-${activity.id}-${index}`}
          variants={itemVariants}
        >
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot>
                <CompletionReportTimelineDot
                  initials={getUserInitials(activity.user)}
                />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              {renderCompletionReport(activity, index)}
            </TimelineContent>
          </TimelineItem>
        </motion.div>
      );
    } else if (activity.type === "comment") {
      return (
        <motion.div
          key={`activity-${activity.id}-${index}`}
          variants={itemVariants}
        >
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot>
                <CommentTimelineDot initials={getUserInitials(activity.user)} />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              {renderComment(activity, index)}

              {hasReplies && (
                <>
                  <motion.div
                    className="flex items-center mb-2 text-sm text-gray-600 dark:text-gray-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.button
                      onClick={() => toggleThreadCollapse(threadId)}
                      className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-100 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        animate={{ rotate: isCollapsed ? 0 : -90 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-center"
                      >
                        <Reply className="h-3 w-3 mr-1" />
                      </motion.div>
                      <span className="text-sm">
                        {isCollapsed ? (
                          <span className="flex items-center">
                            Expand replies ({activity.replies?.length})
                          </span>
                        ) : (
                          <span className="flex items-center">
                            Collapse replies
                          </span>
                        )}
                      </span>
                    </motion.button>
                  </motion.div>

                  <AnimatePresence initial={false} mode="wait">
                    {!isCollapsed && (
                      <motion.div
                        className="space-y-2"
                        key={`thread-content-${threadId}`}
                        id={`thread-content-${threadId}`}
                        initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          overflow: "visible",
                        }}
                        exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                      >
                        {activity.replies?.map((reply, replyIndex) => (
                          <motion.div
                            key={`reply-${activity.id}-${reply.id}-${replyIndex}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.05 * replyIndex,
                              duration: 0.3,
                            }}
                          >
                            {renderComment(reply, replyIndex, true, index)}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </TimelineContent>
          </TimelineItem>
        </motion.div>
      );
    } else {
      return (
        <motion.div
          key={`activity-${activity.id}-${index}`}
          variants={itemVariants}
        >
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-blue-500 h-full w-full flex items-center justify-center text-white text-xs font-medium">
                      {getUserInitials(activity.user)}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <motion.div
                className="flex items-center gap-2 flex-wrap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <TimelineTitle className="font-semibold">
                  {activity.user}
                </TimelineTitle>
                <TimelineDescription className="flex items-center gap-2">
                  <span>{activity.action}</span>
                  {activity.type === "status" ? (
                    <motion.div
                      variants={badgeVariants}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                    >
                      <BadgeStatus value={activity.target!} />
                    </motion.div>
                  ) : (
                    activity.target && (
                      <span className="font-medium flex items-center justify-center">
                        {activity.target}
                      </span>
                    )
                  )}
                  <span className="text-xs text-gray-400 ml-2">
                    {formatTimestamp(activity.time)}
                  </span>
                </TimelineDescription>
              </motion.div>
            </TimelineContent>
          </TimelineItem>
        </motion.div>
      );
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Timeline>
        {activities.map((activity, index) =>
          renderMainActivity(activity, index),
        )}

        <motion.div variants={itemVariants}>
          <TimelineItem>
            <TimelineSeparator>
              <CommentTimelineDot initials={userInitials} />
            </TimelineSeparator>
            <TimelineContent>
              <AnimatePresence mode="wait">
                {showCommentEditor ? (
                  <motion.div
                    className="rounded-lg"
                    key="comment-editor"
                    variants={editorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Form {...mainCommentForm.form}>
                      <form
                        onSubmit={mainCommentForm.form.handleSubmit(
                          handleAddComment,
                        )}
                      >
                        <FormField
                          control={mainCommentForm.form.control}
                          name="comment_content"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <EditorClient
                                  value={field.value}
                                  onChange={(content) => {
                                    field.onChange(content);
                                    mainCommentForm.handleEditorChange(content);
                                  }}
                                  onFileUpload={
                                    mainCommentForm.handleFileUpload
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <motion.div
                          className="flex justify-end gap-2 mt-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <motion.div
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={toggleCommentEditor}
                            >
                              Cancel
                            </Button>
                          </motion.div>
                          <motion.div
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <Button
                              type="submit"
                              size="sm"
                              disabled={mainCommentForm.loading}
                            >
                              {mainCommentForm.loading ? (
                                <motion.span
                                  animate={{ opacity: [1, 0.5, 1] }}
                                  transition={{
                                    repeat: Number.POSITIVE_INFINITY,
                                    duration: 1.5,
                                  }}
                                >
                                  Commenting...
                                </motion.span>
                              ) : (
                                "Comment"
                              )}
                            </Button>
                          </motion.div>
                        </motion.div>
                      </form>
                    </Form>
                  </motion.div>
                ) : showCompletionEditor ? (
                  <motion.div
                    className="rounded-lg border-2 border-orange-200 bg-orange-50 dark:bg-orange-900/20 p-4"
                    key="completion-editor"
                    variants={editorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <motion.div
                      className="flex items-center gap-2 mb-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <FileText className="h-5 w-5 text-orange-600" />
                      <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                        Submit Completion Report
                      </h4>
                    </motion.div>
                    <Form {...completionForm.form}>
                      <form
                        onSubmit={completionForm.form.handleSubmit(
                          handleAddCompletionReport,
                        )}
                      >
                        <FormField
                          control={completionForm.form.control}
                          name="comment_content"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <EditorClient
                                  value={field.value}
                                  onChange={(content) => {
                                    field.onChange(content);
                                    completionForm.handleEditorChange(content);
                                  }}
                                  onFileUpload={completionForm.handleFileUpload}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <motion.div
                          className="flex justify-end gap-2 mt-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <motion.div
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={toggleCompletionEditor}
                            >
                              Cancel
                            </Button>
                          </motion.div>
                          <motion.div
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <Button
                              type="submit"
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700"
                              disabled={completionForm.loading}
                            >
                              {completionForm.loading ? (
                                <motion.span
                                  animate={{ opacity: [1, 0.5, 1] }}
                                  transition={{
                                    repeat: Number.POSITIVE_INFINITY,
                                    duration: 1.5,
                                  }}
                                >
                                  Submitting...
                                </motion.span>
                              ) : (
                                "Submit Completion Report"
                              )}
                            </Button>
                          </motion.div>
                        </motion.div>
                      </form>
                    </Form>
                  </motion.div>
                ) : (
                  <motion.div
                    className="space-y-2"
                    key="input-buttons"
                    variants={editorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <motion.div
                      className="border rounded-lg p-3 w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-transparent"
                      onClick={toggleCommentEditor}
                      whileHover={{
                        scale: 1.01,
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <p className="text-gray-500 text-sm">
                        Write a comment...
                      </p>
                    </motion.div>

                    {canSubmitCompletion && (
                      <motion.div
                        className="border-2 border-orange-200 rounded-lg p-3 w-full cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20 bg-orange-25"
                        onClick={toggleCompletionEditor}
                        whileHover={{
                          scale: 1.01,
                          boxShadow: "0 4px 12px rgba(251, 146, 60, 0.2)",
                        }}
                        whileTap={{ scale: 0.99 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 2,
                              ease: "easeInOut",
                            }}
                          >
                            <FileText className="h-4 w-4 text-orange-600" />
                          </motion.div>
                          <p className="text-orange-700 dark:text-orange-300 text-sm font-medium">
                            Submit completion report for verification...
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </TimelineContent>
          </TimelineItem>
        </motion.div>
      </Timeline>
    </motion.div>
  );
};
