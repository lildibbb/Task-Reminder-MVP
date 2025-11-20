"use client";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User, Shield, Flag, CalendarDays, Repeat, Bell } from "lucide-react";
import { format } from "date-fns";
import { BadgePriority } from "@/components/custom-badge/badge-priority-component";
import { TaskPriority } from "@/enums/task.enum";
import type { UseFormReturn } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TaskFormValues } from "@/schema/taskSchema";
import type { User as UserType } from "@/types/user.types";
import { UserOption } from "@/components/users/user-option";
import { useAuth } from "@/hooks/useAuth";
import { EditableField } from "@/components/shared/editableField";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const REPEAT_OPTIONS = [
  { value: "none", label: "None" },
  { value: "daily", label: "Every Day" }, // not used in backend yet
];

const REMINDER_OPTIONS = [
  { value: "2025-06-12 09:49:28.307", label: "15 minutes before" }, // not used in backend yet
];

export const TaskDetailsSection = ({
  form,
  editingStates,
  users,
}: TaskDetailsSectionProps) => {
  const { user } = useAuth();
  const currentUserId = user?.id;

  // Helper to find user by ID
  const findUser = (userId: string) => users.find((u) => u.id === userId);

  // Watch repeat checkbox state
  const isRepeating = form.watch("is_repeating") || false;
  const repeatFrequency = form.watch("repeat_frequency") || "none";

  return (
    <div className="space-y-0">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-6 w-1 bg-primary rounded-full" />
        <h3 className="font-semibold text-lg">Task Details</h3>
      </div>

      {/* Assignee */}
      <EditableField
        label="Assignee"
        icon={User}
        description="The person responsible for completing this task"
        isEditing={editingStates.editingAssignee}
        onEditToggle={() =>
          editingStates.setEditingAssignee(!editingStates.editingAssignee)
        }
        displayContent={
          <FormField
            control={form.control}
            name="assignee_id"
            render={({ field, fieldState }) => (
              <div>
                <div className="text-sm text-muted-foreground">
                  {field.value ? (
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">
                        {findUser(field.value)?.name ||
                          findUser(field.value)?.email}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Unassigned</span>
                      <button
                        type="button"
                        className="text-primary hover:underline text-xs font-medium"
                        onClick={() => field.onChange(currentUserId)}
                      >
                        assign to me
                      </button>
                    </div>
                  )}
                </div>
                {fieldState.error && (
                  <p className="text-sm font-medium text-destructive mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        }
        editContent={
          <FormField
            control={form.control}
            name="assignee_id"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    editingStates.setEditingAssignee(false);
                  }}
                  defaultValue={field.value ?? undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <ScrollArea className="h-auto w-full max-h-48">
                      {users.map((u) => (
                        <SelectItem
                          key={u.id}
                          value={u.id}
                          className={
                            u.id === currentUserId
                              ? "bg-blue-50 dark:bg-blue-900/50"
                              : ""
                          }
                        >
                          <UserOption
                            user={u}
                            showEmail
                            highlight={u.id === currentUserId}
                          />
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        }
      />

      <div className="border-b border-border/40" />

      {/* Verifier */}
      <EditableField
        label="Verifier"
        description={"The person who will verify the task completion"}
        icon={Shield}
        isEditing={editingStates.editingVerifier}
        onEditToggle={() =>
          editingStates.setEditingVerifier(!editingStates.editingVerifier)
        }
        displayContent={
          <FormField
            control={form.control}
            name="verifier_id"
            render={({ field, fieldState }) => (
              <div>
                <div className="text-sm text-muted-foreground">
                  {field.value ? (
                    <span className="text-foreground font-medium">
                      {findUser(field.value)?.name ||
                        findUser(field.value)?.email}
                    </span>
                  ) : (
                    <span>No verifier assigned</span>
                  )}
                </div>
                {fieldState.error && (
                  <p className="text-sm font-medium text-destructive mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        }
        editContent={
          <FormField
            control={form.control}
            name="verifier_id"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    editingStates.setEditingVerifier(false);
                  }}
                  defaultValue={field.value ?? undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select verifier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <ScrollArea className="h-auto w-full max-h-48">
                      {users.map((u) => (
                        <SelectItem
                          key={u.id}
                          value={u.id}
                          className={
                            u.id === currentUserId
                              ? "bg-blue-50 dark:bg-blue-900/50"
                              : ""
                          }
                        >
                          <UserOption
                            user={u}
                            showEmail
                            highlight={u.id === currentUserId}
                          />
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        }
      />

      <div className="border-b border-border/40" />

      {/* Priority */}
      <EditableField
        label="Priority"
        description={"The importance level of this task"}
        icon={Flag}
        isEditing={editingStates.editingPriority}
        onEditToggle={() =>
          editingStates.setEditingPriority(!editingStates.editingPriority)
        }
        displayContent={
          <FormField
            control={form.control}
            name="priority"
            render={({ field, fieldState }) => (
              <div>
                <div className="text-sm">
                  {field.value ? (
                    <BadgePriority value={field.value} />
                  ) : (
                    <span className="text-muted-foreground">
                      No priority set
                    </span>
                  )}
                </div>
                {fieldState.error && (
                  <p className="text-sm font-medium text-destructive mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        }
        editContent={
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    editingStates.setEditingPriority(false);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      {field.value ? (
                        <BadgePriority value={field.value} />
                      ) : (
                        <SelectValue placeholder="Select priority" />
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(TaskPriority).map((value) => (
                      <SelectItem key={value} value={value}>
                        <BadgePriority value={value} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        }
      />

      <div className="border-b border-border/40" />

      {/* Enhanced Timeline with Repeat */}
      <EditableField
        label="Timeline & Schedule"
        description={"Set dates, times, and repeat settings for this task"}
        icon={CalendarDays}
        isEditing={editingStates.editingDates}
        onEditToggle={() =>
          editingStates.setEditingDates(!editingStates.editingDates)
        }
        displayContent={
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Start:</span>
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <span className="text-sm font-medium">
                    {field.value
                      ? format(new Date(field.value), "PPP 'at' HH:mm")
                      : "Not set"}
                  </span>
                )}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Due:</span>
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <span className="text-sm font-medium">
                    {field.value
                      ? format(new Date(field.value), "PPP 'at' HH:mm")
                      : "Not set"}
                  </span>
                )}
              />
            </div>
            {isRepeating && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Repeat:</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Repeat className="h-3 w-3" />
                  {REPEAT_OPTIONS.find((opt) => opt.value === repeatFrequency)
                    ?.label || "None"}
                </Badge>
              </div>
            )}
          </div>
        }
        editContent={
          <div className="space-y-6">
            {/* Date and Time Selection */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-3">
                      <span className="w-16 text-sm text-muted-foreground font-medium">
                        Start:
                      </span>
                      <DateTimePicker
                        date={field.value ? new Date(field.value) : undefined}
                        onDateChange={(date) => {
                          console.log("Start date changed:", date);
                          console.log("Date type:", typeof date);
                          console.log("Date value:", date?.toISOString());
                          field.onChange(date);

                          // Verify the change was applied
                          setTimeout(() => {
                            console.log(
                              "Form value after change:",
                              form.getValues("start_date"),
                            );
                          }, 100);
                        }}
                        placeholder="Select start date & time"
                        className="flex-1"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center space-x-3">
                      <span className="w-16 text-sm text-muted-foreground font-medium">
                        Due:
                      </span>
                      <DateTimePicker
                        date={field.value ? new Date(field.value) : undefined}
                        onDateChange={(date) => {
                          console.log("Due date changed:", date);
                          console.log("Date type:", typeof date);
                          console.log("Date value:", date?.toISOString());
                          field.onChange(date);

                          // Verify the change was applied
                          setTimeout(() => {
                            console.log(
                              "Form value after change:",
                              form.getValues("due_date"),
                            );
                          }, 100);
                        }}
                        placeholder="Select due date & time"
                        className="flex-1"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Repeat Settings */}
            <Card className="border-dashed">
              <CardContent className="p-4 space-y-4">
                <FormField
                  control={form.control}
                  name="is_repeating"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Repeat className="h-4 w-4" />
                          Make this a repeating task
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">
                          Set up recurring reminders and notifications
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                {isRepeating && (
                  <div className="space-y-4 pl-7">
                    <FormField
                      control={form.control}
                      name="repeat_frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm">
                            Repeat frequency
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value ?? undefined} // Use current form value
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {REPEAT_OPTIONS.filter(
                                (opt) => opt.value !== "none",
                              ).map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reminder_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Reminder notifications
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value ?? undefined} // Use current form value
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="When to remind" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {REMINDER_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            Push notifications will be sent at the specified
                            time
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  // Optional: Add validation here if needed
                  const startDate = form.getValues("start_date");
                  const dueDate = form.getValues("due_date");

                  console.log("Current form values:", {
                    start_date: startDate,
                    due_date: dueDate,
                    is_repeating: form.getValues("is_repeating"),
                    repeat_frequency: form.getValues("repeat_frequency"),
                    reminder_time: form.getValues("reminder_time"),
                  });

                  editingStates.setEditingDates(false);
                }}
                size="sm"
              >
                Done
              </Button>
            </div>
          </div>
        }
      />
    </div>
  );
};

interface TaskDetailsSectionProps {
  form: UseFormReturn<TaskFormValues>;
  editingStates: {
    editingAssignee: boolean;
    setEditingAssignee: (b: boolean) => void;
    editingVerifier: boolean;
    setEditingVerifier: (b: boolean) => void;
    editingStatus: boolean;
    setEditingStatus: (b: boolean) => void;
    editingPriority: boolean;
    setEditingPriority: (b: boolean) => void;
    editingDates: boolean;
    setEditingDates: (b: boolean) => void;
    editingProject: boolean;
    setEditingProject: (b: boolean) => void;
  };
  users: UserType[];
}
