import { DEFAULT_TASK_VALUES } from "@/constants/commentFormConfig";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import APIService from "@/api/apiService";
import { UserAPI } from "@/api/user";
import { useEditorFiles } from "./useEditorFiles";
import { CommentFormValues, commentSchema } from "@/schema/commentSchema";
import { useParams } from "next/navigation";

export const useCommentForm = (
  initialValues?: Partial<CommentFormValues>,
  onAddComment?: (comment: any) => void,
  onAddReply?: (comment: any, parentIndex?: number) => void,
  activities?: any[],
  isCompletionReport?: boolean,
) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const taskId = params?.id;

  const { addFile, getAllFiles, clearFiles } = useEditorFiles();

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema) as any,
    defaultValues: {
      ...DEFAULT_TASK_VALUES,
      ...initialValues,
    },
  });

  const handleEditorChange = (content: any) => {
    form.setValue("comment_content", content, { shouldValidate: true });
  };

  const handleFileUpload = (file: File): Promise<string> => {
    return Promise.resolve(addFile(file));
  };

  const onSubmit = async (
    data: CommentFormValues,
    parentIndex?: number,
    options?: { triggerSuccessCallback?: boolean },
  ) => {
    setLoading(true);
    try {
      const editorFiles = getAllFiles();

      const formData = new FormData();

      if (data.comment_content) {
        if (typeof data.comment_content === "object") {
          formData.append(
            "commentContent",
            JSON.stringify(data.comment_content),
          );
        } else {
          formData.append("commentContent", data.comment_content);
        }
      }

      if (isCompletionReport) {
        formData.append("type", "completion_report");
      }

      if (parentIndex !== undefined && parentIndex >= 0) {
        if (activities && activities.length > parentIndex) {
          const parentCommentId = activities[parentIndex]?.id;
          if (parentCommentId) {
            formData.append("parentCommentId", parentCommentId);
          } else {
            console.warn("Parent comment ID not found in activities array");
          }
        } else if (data.parent_comment_id) {
          formData.append("parentCommentId", data.parent_comment_id);
        } else {
          console.warn("No parent comment ID available for reply");
        }
      }

      if (data.file instanceof File) {
        formData.append("file", data.file);
      }

      editorFiles.forEach((file) => {
        formData.append("file", file);
      });

      const url = UserAPI.comment.create.replace("{taskId}", String(taskId));
      const response = await APIService.post(url, formData, {});
      const shouldTriggerCallback = options?.triggerSuccessCallback ?? true;
      if (shouldTriggerCallback) {
        if (parentIndex !== undefined && onAddReply) {
          onAddReply(data.comment_content, parentIndex);
        } else if (onAddComment) {
          onAddComment(data.comment_content);
        }
      }

      clearFiles();

      toast({
        title: "Success",
        description: isCompletionReport
          ? "Completion report submitted successfully"
          : parentIndex !== undefined
            ? "Reply added successfully"
            : "Comment created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: isCompletionReport
          ? "Failed to submit completion report"
          : parentIndex !== undefined
            ? "Failed to add reply"
            : "Failed to create comment",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async (data: CommentFormValues) => {
    setLoading(true);
    try {
      const editorFiles = getAllFiles();

      const formData = new FormData();

      if (data.comment_content) {
        if (typeof data.comment_content === "object") {
          formData.append(
            "comment_content",
            JSON.stringify(data.comment_content),
          );
        } else {
          formData.append("comment_content", data.comment_content);
        }
      }

      if (data.file instanceof File) {
        formData.append("file", data.file);
      }

      editorFiles.forEach((file) => {
        console.log(`Appending file:`, file.name);
        formData.append("file", file);
      });

      const response = await APIService.post(UserAPI.task.create, formData, {});

      clearFiles();

      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update comment",
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
