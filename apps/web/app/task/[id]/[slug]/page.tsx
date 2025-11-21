"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ClipboardList, CheckCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { convertJsonToHtml } from "@/lib/json-to-html";
import { CustomBreadcrumb } from "@/components/custom-breadcrumb/breadcrumb-custom-component";
import { BREADCRUMB_ITEMS } from "@/constants/taskViewConfig";
import Link from "next/link";
import { ActivityLog } from "@/components/task/activity-log";
import { TaskFormFields } from "@/components/Form/TaskForm/TaskFormFields";
import { Form } from "@/components/ui/form";
import { FormActions } from "@/components/Form/TaskForm/FormActions";
import { useTaskForm } from "@/hooks/useTaskForm";
import { useTaskFormEditing } from "@/hooks/useTaskFormEditing";
import { FormActionType } from "@/components/Form/TaskForm/FormActions";
import {
  formatDate,
  formatTimestamp,
  getUserInitialsAndName,
} from "@/helpers/helper";
import APIService from "@/api/apiService";
import { AdminAPI } from "@/api/admin";
import { UserAPI } from "@/api/user";
import { TaskData, ApiTaskData, Activity } from "@/types/task.types";
import { User } from "@/types/user.types";
import AvatarGroup from "@/components/avatar/multiAvatar";
import { useParams } from "next/navigation";
import { ActionType } from "@/enums/action-type.enum";
import { BadgeStatus } from "@/components/custom-badge/badge-status-component";
import { BadgePriority } from "@/components/custom-badge/badge-priority-component";
import Loading from "./loading";
import { useAuth } from "@/hooks/useAuth";
import { TaskStatus } from "@/enums/task.enum";

const generateOptimisticId = (() => {
  let counter = -1;
  return () => counter--;
})();

export default function TaskDetailPage() {
  
  const params = useParams();
  const taskId = params.id as string;


  const [isEditing, setIsEditing] = useState(false);
  const [taskData, setTaskData] = useState<TaskData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);


  const formData = useMemo(() => {
    if (!taskData) return null;
    return {
      ...taskData,
      start_date: taskData.start_date
        ? new Date(taskData.start_date)
        : undefined,
      due_date: taskData.due_date ? new Date(taskData.due_date) : undefined,
    };
  }, [taskData]);

 
  const {
    form,
    loading: formLoading,
    onUpdate,
    handleFileUpload,
  } = useTaskForm(formData ?? {});
  const editingStates = useTaskFormEditing();
  const { user } = useAuth();
  const currentUserId = user?.id || null;

  useEffect(() => {
    if (formData) {
      form.reset(formData);
    }
  }, [formData, form]);

  const fetchTaskData = useCallback(async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      const response = await APIService.get(
        UserAPI.activityLog.list.replace("{taskId}", taskId),
      );

      const apiData: ApiTaskData = response.data.data;
      console.log("Fetched Task Data:", apiData);
      const transformedData = transformApiData(apiData);
      console.log("Transformed Task Data:", transformedData);
      setTaskData(transformedData);
    } catch (error) {
      console.error("Failed to fetch task data:", error);
      setTaskData(null);
    } finally {
      setLoading(false);
    }
  }, [taskId]);


  const fetchUsers = useCallback(async () => {
    try {
      const response = await APIService.get(AdminAPI.users.list);
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    }
  }, []);

  useEffect(() => {
    fetchTaskData();
    fetchUsers();
  }, [fetchTaskData, fetchUsers]);

  const transformApiData = useCallback((apiData: ApiTaskData): TaskData => {
    const { task, comment, activityLog } = apiData;

    const resolutionEvents = new Map<
      string,
      { action: string; resolution: "approved" | "rejected" }
    >();

    activityLog.forEach((log) => {
      if (log.actionType === "COMPLETION_REPORT_RESOLUTION") {
        const targetReportId = log.actionDetails?.target;
        if (targetReportId) {
          resolutionEvents.set(String(targetReportId), {
            action: log.actionDetails!.action,
            resolution: log.actionDetails!.action.includes("approved")
              ? "approved"
              : "rejected",
          });
        }
      }
    });

    const participants = [
      task.createdByUser,
      task.assigneeUser,
      task.verifierUser,
    ]
      .filter(Boolean)
      .filter(
        (user, index, arr) =>
          arr.findIndex((u) => u!.id === user!.id) === index,
      )
      .map((user) => {
        const { initials } = getUserInitialsAndName(user!);
        return {
          initials,
          id: user!.id,
          name: user!.name,
        };
      });

    const comments: Activity[] = comment.map((c) => {
      const resolutionEvent = resolutionEvents.get(c.id);

      return {
        id: c.id,
        type: c.type as Activity["type"],
        user: c.user.name,
        username: `@${c.user.username}`,
        time: c.createdAt,
        content: JSON.parse(c.commentContent),
        isResolved:
          c.type === "completion_report" ? !!resolutionEvent : undefined,
        resolution:
          c.type === "completion_report"
            ? resolutionEvent?.resolution
            : undefined,
        replies:
          c.children?.map((reply) => ({
            id: reply.id,
            type: "comment" as const,
            user: reply.user.name,
            username: `@${reply.user.username}`,
            time: reply.createdAt,
            content: JSON.parse(reply.commentContent),
            replies: [],
          })) || [],
      };
    });

 
    const logs: Activity[] = activityLog
      .filter((log) => log.actionType !== "COMPLETION_REPORT_RESOLUTION")
      .map((log) => ({
        id: log.id,
        type: getActivityType(log.actionType),
        user: log.user.name,
        username: `@${log.user.username}`,
        time: log.createdAt,
        action: getActivityAction(log.actionType),
        target: log.actionDetails?.target,
        replies: [],
      }));

    return {
      id: task.id,
      title: task.title,
      status: task.status,
      expected_result: task.expectedResult,
      priority: task.priority,
      createdAt: task.createdAt,
      verifier: task.verifierUser?.name,
      assignee: task.assigneeUser?.name,
      createdBy: task.createdByUser?.name,
      description: task.description,
      start_date: task.startDate,
      due_date: task.dueDate,
      is_repeating: task.isRepeating,
      repeat_frequency: task.repeatFrequency,
      reminder_time: task.reminderTime,
      participants,
      activities: [...comments, ...logs].sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
      ),
      assignee_id: task.assigneeUser?.id || undefined,
      verifier_id: task.verifierUser?.id || undefined,
      project_id: task.projectId || undefined,
      file: null,
    };
  }, []);


  const getActivityType = (actionType: string): Activity["type"] => {
    switch (actionType) {
      case ActionType.CHANGE_STATUS:
        return "status";
      case ActionType.CHANGE_PRIORITY:
        return "priority";
      case ActionType.ASSIGN_ASSIGNEE:
        return "assignment";
      case ActionType.SET_DUE_DATE:
        return "due_date";
      default:
        return "activity";
    }
  };

  const getActivityAction = (actionType: string): string => {
    switch (actionType) {
      case ActionType.CHANGE_STATUS:
        return "changed status";
      case ActionType.CHANGE_PRIORITY:
        return "changed priority to";
      case ActionType.ASSIGN_ASSIGNEE:
        return "assigned";
      case ActionType.SET_DUE_DATE:
        return "set due date to";
      case ActionType.CHANGE_DESCRIPTION:
        return "changed description";
      case ActionType.CHANGE_EXPECTED_RESULT:
        return "changed expected result ";
      case ActionType.CHANGE_TITLE:
        return "changed title to";
      default:
        return "performed action";
    }
  };


  const createOptimisticActivity = useCallback(
    (
      type: Activity["type"],
      content?: any,
      action?: string,
      target?: any,
    ): Activity => ({
      id: generateOptimisticId().toString(),
      type,
      user: user?.name || "Current User",
      username: `@${user?.username || user?.email?.split("@")[0] || "currentuser"}`,
      time: new Date().toISOString(),
      content,
      action,
      target,
      replies: [],
    }),
    [user],
  );


  const updateTaskDataOptimistically = useCallback(
    (updater: (prev: TaskData) => TaskData) => {
      setTaskData((prev) => {
        if (!prev) return prev;
        return updater(prev);
      });

      return {
        rollback: () => {
          fetchTaskData();
        },
      };
    },
    [fetchTaskData],
  );

  const handleAddCompletionReport = useCallback(
    async (comment: any) => {
      const { rollback } = updateTaskDataOptimistically((prev) => {
        const newCompletionReport = createOptimisticActivity(
          "completion_report",
          comment,
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
      } catch (error) {
        console.error("Completion report submission failed:", error);
        rollback();
      }
    },
    [createOptimisticActivity, updateTaskDataOptimistically],
  );


  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      const { rollback } = updateTaskDataOptimistically((prev) => {
        const statusChange = createOptimisticActivity(
          "status",
          undefined,
          "changed status",
          newStatus,
        );

        return {
          ...prev,
          status: newStatus,
          activities: [...prev.activities, statusChange],
        };
      });

      try {
        await APIService.patch(
          UserAPI.task.update.replace("{taskId}", taskId),
          { status: newStatus },
        );
        await fetchTaskData(); 
      } catch (error) {
        console.error("Failed to update status:", error);
        rollback();
      }
    },
    [
      taskId,
      createOptimisticActivity,
      updateTaskDataOptimistically,
      fetchTaskData,
    ],
  );


  const handleResolveCompletionReport = useCallback(
    async (reportId: string, isApproved: boolean) => {
      const action = isApproved ? "approved" : "rejected";
      const newStatus = isApproved
        ? TaskStatus.VERIFIED
        : TaskStatus.VERIFICATION_FAILED;

      const { rollback } = updateTaskDataOptimistically((prev) => {
        const resolveActivity = createOptimisticActivity(
          "completion_report_resolution",
          undefined,
          `${action} completion report`,
          reportId,
        );
        const statusChange = createOptimisticActivity(
          "status",
          undefined,
          "changed status",
          newStatus,
        );

        const updatedActivities = prev.activities.map((activity) => {
          if (
            activity.id === reportId &&
            activity.type === "completion_report"
          ) {
            return {
              ...activity,
              isResolved: true,
              resolution: action as "approved" | "rejected",
            };
          }
          return activity;
        });

        return {
          ...prev,
          status: newStatus,
          activities: [...updatedActivities, resolveActivity, statusChange],
        };
      });

      try {
        await APIService.patch(
          UserAPI.task.update.replace("{taskId}", taskId),
          {
            status: newStatus,
            resolvedReportId: reportId,
          },
        );
        await fetchTaskData(); // Refresh to get server state
      } catch (error) {
        console.error("Failed to resolve completion report:", error);
        rollback();
      }
    },
    [
      taskId,
      createOptimisticActivity,
      updateTaskDataOptimistically,
      fetchTaskData,
    ],
  );

  // Permission checks
  const canStartTask = useCallback(() => {
    return (
      taskData?.assignee_id === currentUserId &&
      (taskData?.status === TaskStatus.NEW ||
        taskData?.status === TaskStatus.VERIFICATION_FAILED)
    );
  }, [taskData, currentUserId]);

  const canSubmitCompletion = useCallback(() => {
    return (
      taskData?.assignee_id === currentUserId &&
      taskData?.status === TaskStatus.DOING
    );
  }, [taskData, currentUserId]);

  const canVerify = useCallback(() => {
    return (
      taskData?.verifier_id === currentUserId &&
      taskData?.status === TaskStatus.PENDING_VERIFICATION
    );
  }, [taskData, currentUserId]);

  const canClose = useCallback(() => {
    return (
      taskData?.status === TaskStatus.VERIFIED &&
      user?.name === taskData?.createdBy
    );
  }, [taskData, user]);

  // Handle form submission
  const handleFormSubmit = useCallback(
    async (data: any) => {
      try {
        await onUpdate(data);
        setIsEditing(false);
        await fetchTaskData();
      } catch (error) {
        console.error("Failed to update task:", error);
      }
    },
    [onUpdate, fetchTaskData],
  );

  // Handle edit cancellation
  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    if (formData) {
      form.reset(formData);
    }
  }, [setIsEditing, form, formData]);

  // Handle assign yourself
  const handleAssignYourself = useCallback(() => {
    if (currentUserId) {
      setIsEditing(true);
      setTimeout(() => {
        form.setValue("assignee_id", currentUserId);
      }, 0);
    }
  }, [currentUserId, form]);

  if (loading || !taskData) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto py-4 px-3">
      <CustomBreadcrumb
        icon={<ClipboardList className="h-4 w-4" />}
        items={BREADCRUMB_ITEMS}
      />

      <Link href="/task">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-lg hover:bg-slate-100 dark:hover:bg-opacity-20 p-0"
        >
          ← Back to tasks
        </Button>
      </Link>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          <div className={isEditing ? "w-full" : "w-full lg:w-2/3"}>
            <div className="mb-6">
              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                    <TaskFormFields
                      form={form}
                      editingStates={editingStates}
                      handleFileUpload={handleFileUpload}
                      setUsers={users}
                    />
                    <FormActions
                      loading={formLoading}
                      type={FormActionType.EDIT}
                      onCancel={handleEditCancel}
                    />
                  </form>
                </Form>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-3">
                    <div className="w-full md:w-auto">
                      <h1 className="text-xl md:text-2xl font-bold">
                        {taskData.title}
                      </h1>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto justify-start sm:justify-end flex-wrap">
                      {canStartTask() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(TaskStatus.DOING)}
                          className="flex items-center gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Start Task
                        </Button>
                      )}
                      {canClose() && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleStatusChange(TaskStatus.CLOSED)}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Close Task
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-6 text-sm text-gray-600 dark:text-white flex-wrap">
                    <BadgeStatus value={taskData.status} />
                    <span>
                      Task created {formatTimestamp(taskData.createdAt)} by
                    </span>
                    <span className="font-medium">{taskData.createdBy}</span>
                  </div>

                  {/* Description Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Description</h3>
                    <div
                      className="prose max-w-none dark:prose-invert border rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
                      dangerouslySetInnerHTML={{
                        __html: convertJsonToHtml(taskData.description),
                      }}
                    />
                  </div>

                  {/* Expected Result Section */}
                  {taskData.expected_result && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">
                        Expected Result
                      </h3>
                      <div
                        className="prose max-w-none dark:prose-invert border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20"
                        dangerouslySetInnerHTML={{
                          __html: convertJsonToHtml(taskData.expected_result),
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <h2 className="text-lg font-semibold">Activity</h2>
              </div>
              <ActivityLog
                activities={taskData.activities}
                userInitials={taskData.createdBy
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
                onRefreshData={fetchTaskData}
                onAddCompletionReport={handleAddCompletionReport}
                onResolveCompletionReport={handleResolveCompletionReport}
                canSubmitCompletion={canSubmitCompletion()}
                canVerify={canVerify()}
                currentUserId={currentUserId}
                currentUser={user}
                setTaskData={setTaskData}
                taskID={taskId}
              />
            </div>
          </div>

          {!isEditing && (
            <div className="w-full lg:w-1/3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Assignee</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    {taskData.assignee_id ? (
                      <>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-blue-500 h-full w-full flex items-center justify-center text-white text-xs">
                            {
                              taskData.participants.find(
                                (p) => p.name === taskData.assignee,
                              )?.initials
                            }
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{taskData.assignee}</span>
                      </>
                    ) : (
                      <>
                        None -
                        <span
                          className="text-sm cursor-pointer hover:underline hover:text-primary"
                          onClick={handleAssignYourself}
                        >
                          assign yourself
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Verifier</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    {taskData.verifier_id ? (
                      <>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-blue-500 h-full w-full flex items-center justify-center text-white text-xs">
                            {
                              taskData.participants.find(
                                (p) => p.name === taskData.verifier,
                              )?.initials
                            }
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{taskData.verifier}</span>
                      </>
                    ) : (
                      <span className="text-sm">None</span>
                    )}
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Status</h3>
                   
                  </div>
                  <div className="space-y-2">
                    <BadgeStatus value={taskData.status} />
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Priority</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <BadgePriority value={taskData.priority} />
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Dates</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start:</span>
                      <span>
                        {taskData.start_date
                          ? formatDate(taskData.start_date)
                          : "None"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due:</span>
                      <span>
                        {taskData.due_date
                          ? formatDate(taskData.due_date)
                          : "None"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">
                    {taskData.participants.length} Participants
                  </h3>
                  <div className="flex gap-2">
                    <AvatarGroup users={taskData.participants} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
