import { DEFAULT_TASK_VALUES } from "@/constants/taskFormConfig";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { TaskFormValues, taskSchema } from "@/schema/taskSchema";
import APIService from "@/api/apiService";
import { UserAPI } from "@/api/user";

import { useEditorFiles } from "./useEditorFiles";
import { useParams, useRouter } from "next/navigation";

export const useTaskForm = (initialValues?: Partial<TaskFormValues>) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { addFile, getAllFiles, clearFiles } = useEditorFiles();
  const params = useParams();

  const taskId = params?.id;
  const router = useRouter();
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema) as any,
    defaultValues: {
      ...DEFAULT_TASK_VALUES,
      ...initialValues,
    },
  });

  const handleEditorChange = (content: any) => {
    form.setValue("description", content, { shouldValidate: true });
    form.setValue("expected_result", content, { shouldValidate: true });
  };

  const handleFileUpload = (file: File): Promise<string> => {
    return Promise.resolve(addFile(file));
  };

  const onSubmit = async (data: TaskFormValues) => {
    setLoading(true);
    try {
      const editorFiles = getAllFiles();

      const formData = new FormData();

      formData.append("title", data.title);

      formData.append("priority", data.priority);

      if (data.description) {
        if (typeof data.description === "object") {
          formData.append("description", JSON.stringify(data.description));
        } else {
          formData.append("description", data.description);
        }
      }
      if (data.expected_result) {
        if (typeof data.expected_result === "object") {
          formData.append(
            "expectedResult",
            JSON.stringify(data.expected_result),
          );
        } else {
          formData.append("expectedResult", data.expected_result);
        }
      }

      if (data.start_date) {
        formData.append("startDate", data.start_date.toISOString());
      }
      if (data.due_date) {
        formData.append("dueDate", data.due_date.toISOString());
      }
      if (data.is_repeating) {
        formData.append("isRepeating", String(data.is_repeating));
      }
      if (data.reminder_time) {
        formData.append("reminderTime", data.reminder_time);
      }
      if (data.repeat_frequency) {
        formData.append("repeatFrequency", data.repeat_frequency);
      }
      if (data.project_id) {
        formData.append("projectId", data.project_id);
      }
      if (data.assignee_id) {
        formData.append("assigneeId", data.assignee_id);
      }
      if (data.verifier_id) {
        formData.append("verifierId", data.verifier_id);
      }

      if (data.file instanceof File) {
        formData.append("file", data.file);
      }

      editorFiles.forEach((file) => {
        formData.append("file", file);
      });

      // // Debug: Log FormData entries
      // console.log("FormData entries:");
      // for (const pair of formData.entries()) {
      //   console.log(pair[0], pair[1]);
      // }

      const response = await APIService.post(UserAPI.task.create, formData, {});

      clearFiles();

      toast({
        title: "Success",
        description: "Task created successfully",
      });
      router.push("/task");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const onUpdate = async (data: TaskFormValues) => {
    setLoading(true);
    try {
      const editorFiles = getAllFiles();

      const formData = new FormData();

      // Problem : cannot compare object with object // TODO
      const hasChanged = (key: keyof TaskFormValues, value: any) => {
        if (!initialValues || !(key in initialValues)) return true;
        const originalValue = initialValues[key];
        if (typeof value === "object" && value instanceof Date) {
          return (
            !originalValue ||
            originalValue.toISOString() !== value.toISOString()
          );
        }
        return originalValue !== value;
      };

      // Append only changed fields
      if (hasChanged("title", data.title)) {
        formData.append("title", data.title);
      }

      if (hasChanged("priority", data.priority)) {
        formData.append("priority", data.priority);
      }
      if (hasChanged("description", data.description)) {
        if (typeof data.description === "object") {
          formData.append("description", JSON.stringify(data.description));
        } else {
          formData.append("description", data.description);
        }
      }
      if (hasChanged("expected_result", data.expected_result)) {
        if (typeof data.expected_result === "object") {
          formData.append(
            "expectedResult",
            JSON.stringify(data.expected_result),
          );
        } else {
          formData.append("expectedResult", data.expected_result);
        }
      }

      if (hasChanged("start_date", data.start_date)) {
        formData.append("startDate", data.start_date?.toISOString() || "");
      }
      if (hasChanged("due_date", data.due_date)) {
        formData.append("dueDate", data.due_date?.toISOString() || "");
      }
      if (hasChanged("project_id", data.project_id)) {
        formData.append("projectId", data.project_id || "");
      }
      if (hasChanged("assignee_id", data.assignee_id)) {
        formData.append("assigneeId", data.assignee_id || "");
      }
      if (hasChanged("verifier_id", data.verifier_id)) {
        formData.append("verifierId", data.verifier_id || "");
      }
      if (hasChanged("is_repeating", data.is_repeating)) {
        formData.append("isRepeating", String(data.is_repeating));
      }
      if (hasChanged("reminder_time", data.reminder_time)) {
        formData.append("reminderTime", data.reminder_time || "");
      }
      if (hasChanged("repeat_frequency", data.repeat_frequency)) {
        formData.append("repeatFrequency", data.repeat_frequency || "");
      }
      if (data.file instanceof File) {
        formData.append("file", data.file);
      }

      editorFiles.forEach((file) => {
        formData.append("file", file);
      });
      //
      // console.log("FormData entries (changed fields only):");
      // for (const pair of formData.entries()) {
      //   console.log(pair[0], pair[1]);
      // }

      const url = UserAPI.task.update.replace("{taskId}", String(taskId));
      const response = await APIService.patch(url, formData);

      clearFiles();

      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    onSubmit,
    onUpdate,
    handleEditorChange,
    handleFileUpload,
  };
};
