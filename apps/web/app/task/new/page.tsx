"use client";
import { TaskFormFields } from "@/components/Form/TaskForm/TaskFormFields";
import { useTaskForm } from "@/hooks/useTaskForm";
import { useTaskFormEditing } from "@/hooks/useTaskFormEditing";
import { BREADCRUMB_ITEMS } from "@/constants/taskFormConfig";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { CustomBreadcrumb } from "@/components/custom-breadcrumb/breadcrumb-custom-component";
import {
  FormActions,
  FormActionType,
} from "@/components/Form/TaskForm/FormActions";
import { Form } from "@/components/ui/form";
import { useEffect, useState } from "react";
import APIService from "@/api/apiService";
import { AdminAPI } from "@/api/admin";
import { User } from "@/types/user.types";

export default function NewTaskPage() {
  const { form, loading, onSubmit, handleFileUpload } = useTaskForm();
  const editingStates = useTaskFormEditing();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await APIService.get(AdminAPI.users.list);
        setUsers(response.data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      }
    };

    getUsers();
  }, []);

  return (
    <div className="container mx-auto py-6 px-4">
      <CustomBreadcrumb
        icon={<ClipboardList className="h-4 w-4" />}
        items={BREADCRUMB_ITEMS}
      />

      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">New Task</h1>
        <p className="text-gray-600 mb-8">
          Create a new task and assign it to a project or user.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TaskFormFields
              form={form}
              editingStates={editingStates}
              handleFileUpload={handleFileUpload}
              setUsers={users}
            />
            <FormActions
              loading={loading}
              onCancel={() => router.push("/task")}
              type={FormActionType.CREATE}
            />
          </form>
        </Form>
      </div>
    </div>
  );
}
