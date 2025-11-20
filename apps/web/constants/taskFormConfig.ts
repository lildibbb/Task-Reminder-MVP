import { TaskPriority } from "@/enums/task.enum";
import { TaskFormValues } from "@/schema/taskSchema";

export const DEFAULT_TASK_VALUES: TaskFormValues = {
  title: "",
  description: null,
  priority: TaskPriority.LOW,
  expected_result: null,
  start_date: undefined,
  due_date: undefined, // fix this later :V
  is_repeating: false,
  repeat_frequency: "",
  reminder_time: "",
  project_id: null,
  assignee_id: "",
  verifier_id: "",
  file: undefined,
};
export const BREADCRUMB_ITEMS = [
  { link: "/task", text: "Tasks" },
  { link: "/task", text: "List Tasks" },
  { link: "/task/new", text: "New Task" },
];
