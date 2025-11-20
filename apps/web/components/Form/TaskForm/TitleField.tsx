import { UseFormReturn } from "react-hook-form";
import { TaskFormValues } from "@/schema/taskSchema";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LabelTooltip } from "@/components/label/label-tooltip";

interface TitleFieldProps {
  form: UseFormReturn<TaskFormValues>;
}

export const TitleField = ({ form }: TitleFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem className="space-y-2">
          <LabelTooltip
            label="Task Title"
            className="text-base font-medium"
            description="Task Title is required"
          />
          <FormControl>
            <Input
              placeholder="Enter Task Title"
              {...field}
              className="text-base py-2"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
