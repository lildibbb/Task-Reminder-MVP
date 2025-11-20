import * as z from "zod";
import { TaskPriority } from "@/enums/task.enum";

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.any().optional().nullable(),
  priority: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.enum(Object.values(TaskPriority) as [string, ...string[]], {
      required_error: "Priority is required",
    }),
  ),
  expected_result: z.any().optional().nullable(),
  start_date: z
    .preprocess((val) => {
      if (val instanceof Date) {
        return val;
      }
      if (typeof val === "string" || val === undefined) {
        return val ? new Date(val) : undefined;
      }
      return undefined;
    }, z.date().optional().nullable())
    .refine((val) => !val || !isNaN(val.getTime()), {
      message: "Invalid date",
    }),
  due_date: z
    .preprocess((val) => {
      if (val instanceof Date) {
        return val;
      }
      if (typeof val === "string" || val === undefined) {
        return val ? new Date(val) : undefined;
      }
      return undefined;
    }, z.date().optional().nullable())
    .refine((val) => !val || !isNaN(val.getTime()), {
      message: "Invalid date",
    }),
  is_repeating: z.boolean().optional().default(false),
  repeat_frequency: z.string().optional().nullable(),
  reminder_time: z.string().optional().nullable(),
  project_id: z.string().optional().nullable(),
  assignee_id: z
    .string({
      invalid_type_error: "Please select an assignee.",
      required_error: "Assignee is required.",
    })
    .min(1, { message: "Assignee is required." }),
  verifier_id: z
    .string({
      invalid_type_error: "Please select a verifier.",
      required_error: "Verifier is required.",
    })
    .min(1, { message: "Verifier is required." }),
  file: z.instanceof(File).optional().nullable(),
});
export type TaskFormValues = z.infer<typeof taskSchema>;
