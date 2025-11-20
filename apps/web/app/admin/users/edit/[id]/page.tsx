"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  CalendarCheck,
  CalendarPlus,
  FileText,
  Flag,
  LucideIcon,
  MessageSquare,
  Shuffle,
  Target,
  Type,
  UserPlus,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { formatDate, formatTimestamp } from "@/helpers/helper";
import { Status, UserRole } from "@/types/schema.types";
import { CustomBreadcrumb } from "@/components/custom-breadcrumb/breadcrumb-custom-component";
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
import APIService from "@/api/apiService";
import { UserAPI } from "@/api/user";
import { BadgeStatus } from "@/components/custom-badge/badge-status-component";
import { BadgePriority } from "@/components/custom-badge/badge-priority-component";
import { Label } from "@/components/ui/label";
import Case from "case";
import { AdminAPI } from "@/api/admin";
import { ActionType } from "@/enums/action-type.enum";

const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").optional(),
  email: z.string().email("Please enter a valid email address.").optional(),
  role: z.string({ required_error: "Please select a role." }).optional(),
  status: z.string({ required_error: "Please select a status" }).optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const getActivityIcon = (actionType: ActionType | string): LucideIcon => {
  switch (actionType) {
    case ActionType.ADD_COMMENT:
      return MessageSquare;
    case ActionType.ASSIGN_ASSIGNEE:
      return UserPlus;
    case ActionType.CHANGE_STATUS:
      return Shuffle;
    case ActionType.SET_DUE_DATE:
      return CalendarPlus;
    case ActionType.CHANGE_DUE_DATE:
      return CalendarCheck;
    case ActionType.CHANGE_PRIORITY:
      return Flag;
    case ActionType.CHANGE_EXPECTED_RESULT:
      return Target;
    case ActionType.CHANGE_TITLE:
      return Type;
    case ActionType.CHANGE_DESCRIPTION:
      return FileText;
    default:
      return FileText;
  }
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("activity");
  const [activities, setActivities] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [user, setUser] = useState<any>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { name: "", email: "", role: "", status: "" },
    mode: "onChange",
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      setLoadingData(true);
      try {
        const res = await APIService.get(
          AdminAPI.users.listById.replace("{id}", String(id)),
        );
        setUser(res?.data?.data);
        if (res?.data?.data) {
          form.reset({
            name: res.data.data.name || "",
            email: res.data.data.email || "",
            role: res.data.data.role || "",
            status: res.data.data.status || "",
          });
        }

        const [activitiesRes, tasksRes] = await Promise.all([
          APIService.get(
            UserAPI.activityLog.listByUserId.replace("{userId}", String(id)),
          ),
          APIService.get(
            UserAPI.task.listByUserId.replace("{userId}", String(id)),
          ),
        ]);
        setActivities(activitiesRes?.data?.data || []);
        setTasks(tasksRes?.data?.data || []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch user data.",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchUser();
  }, [id]);

  async function onSubmit(data: UserFormValues) {
    setIsLoading(true);
    try {
      await APIService.patch(
        AdminAPI.users.update.replace("{id}", String(id)),
        data,
      );
      toast({
        title: "User updated",
        description: "User information has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const statusOptions = Object.values(Status);
  const userRoleOptions = Object.values(UserRole);

  return (
    <motion.div
      className="container mx-auto py-4 px-4 sm:py-6 max-w-7xl"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      <CustomBreadcrumb
        id={id as string}
        items={[{ link: "/", text: "Users" }]}
        showEdit={true}
      />

      <div className="grid gap-6 mt-6">
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardTitle className="text-xl">User Information</CardTitle>
            <CardDescription>
              Update basic user details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {userRoleOptions.map((user) => (
                              <SelectItem key={user} value={user}>
                                {Case.capital(user)}
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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {Case.capital(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/users")}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {activeTab === "activity" && (
              <TabsContent value="activity" key="activity">
                <motion.div
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                >
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                      <CardTitle>User Activity</CardTitle>
                      <CardDescription>
                        Recent actions performed by this user
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      {loadingData ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-muted-foreground">
                            Loading...
                          </div>
                        </div>
                      ) : (
                        <ScrollArea className="h-[400px] w-full">
                          {activities.length === 0 ? (
                            <div className="flex items-center justify-center h-full py-8 text-muted-foreground">
                              No activity found.
                            </div>
                          ) : (
                            <Timeline>
                              {activities.map((activity, index) => {
                                const IconComponent = getActivityIcon(
                                  activity.actionType,
                                );
                                return (
                                  <TimelineItem
                                    key={activity.id}
                                    className="pb-4"
                                  >
                                    <TimelineSeparator>
                                      <TimelineDot className="text-primary">
                                        <IconComponent className="h-4 w-4" />
                                      </TimelineDot>
                                      {index < activities.length - 1 && (
                                        <TimelineConnector />
                                      )}
                                    </TimelineSeparator>
                                    <TimelineContent>
                                      <TimelineTitle className="font-medium">
                                        {activity.actionType} to{" "}
                                        {activity.task?.title || "Unknown Task"}
                                      </TimelineTitle>
                                      <TimelineDescription className="text-xs text-muted-foreground">
                                        {formatTimestamp(activity.createdAt)}
                                      </TimelineDescription>
                                    </TimelineContent>
                                  </TimelineItem>
                                );
                              })}
                            </Timeline>
                          )}
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            )}

            {activeTab === "tasks" && (
              <TabsContent value="tasks" key="tasks">
                <motion.div
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                >
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
                      <CardTitle>Tasks Assigned</CardTitle>
                      <CardDescription>
                        Tasks currently assigned to this user
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                      {loadingData ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-muted-foreground">
                            Loading...
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Mobile Card Layout */}
                          <div className="block sm:hidden">
                            <ScrollArea className="h-[400px] w-full">
                              <div className="space-y-4 p-2">
                                {tasks.length === 0 ? (
                                  <div className="flex items-center justify-center h-40 text-muted-foreground">
                                    No tasks assigned.
                                  </div>
                                ) : (
                                  tasks.map((task) => (
                                    <div
                                      key={task.id}
                                      className="rounded-2xl p-4 shadow-md transition-shadow hover:shadow-lg"
                                    >
                                      <div className="flex items-start justify-between mb-3">
                                        <Label className="font-bold">
                                          {task.title}
                                        </Label>
                                        <div className="flex items-center gap-2">
                                          <BadgePriority
                                            value={task.priority}
                                          />
                                          <BadgeStatus value={task.status} />
                                        </div>
                                      </div>

                                      <div className="flex justify-end items-center mt-2">
                                        <svg
                                          className="w-4 h-4 text-gray-400 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          viewBox="0 0 24 24"
                                          aria-hidden="true"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                          />
                                        </svg>
                                        <span className="text-xs text-gray-400">
                                          {formatDate(task.createdAt)}
                                        </span>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </ScrollArea>
                          </div>

                          {/* Desktop Table Layout */}
                          <div className="hidden sm:block">
                            <ScrollArea className="h-[400px] w-full">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {tasks.length === 0 ? (
                                    <TableRow>
                                      <TableCell
                                        colSpan={4}
                                        className="text-center text-muted-foreground"
                                      >
                                        No tasks assigned.
                                      </TableCell>
                                    </TableRow>
                                  ) : (
                                    tasks.map((task) => (
                                      <TableRow key={task.id}>
                                        <TableCell className="font-medium">
                                          {task.title}
                                        </TableCell>
                                        <TableCell>
                                          <Badge variant="outline">
                                            {task.priority}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <BadgeStatus value={task.status} />
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          {formatDate(task.createdAt)}
                                        </TableCell>
                                      </TableRow>
                                    ))
                                  )}
                                </TableBody>
                              </Table>
                            </ScrollArea>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            )}
          </AnimatePresence>
        </Tabs>
      </div>
    </motion.div>
  );
}
