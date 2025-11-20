import { UseFormReturn } from "react-hook-form";
import { TaskFormValues } from "@/schema/taskSchema";
import { TitleField } from "@/components/Form/TaskForm/TitleField";
import { useTaskFormEditing } from "@/hooks/useTaskFormEditing";
import { DescriptionSection } from "@/components/Form/TaskForm/DescriptionSection";
import { TaskDetailsSection } from "@/components/Form/TaskForm/TaskDetailsSection";
import { User } from "@/types/user.types";

interface TaskFormFieldsProps {
  form: UseFormReturn<TaskFormValues>;
  editingStates: ReturnType<typeof useTaskFormEditing>;
  handleFileUpload: (file: File) => Promise<string>; // Add this prop
  setUsers: User[];
}

export const TaskFormFields = ({
  form,
  editingStates,
  handleFileUpload,
  setUsers,
}: TaskFormFieldsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <TitleField form={form} />
        <DescriptionSection form={form} handleFileUpload={handleFileUpload} />
      </div>
      <TaskDetailsSection
        form={form}
        editingStates={editingStates}
        users={setUsers}
      />
    </div>
  );
};
