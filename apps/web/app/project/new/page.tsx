"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileCode2 } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as z from "zod";

import APIService from "@/api/apiService";
import { UserAPI } from "@/api/user";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { VisibilityType } from "@/types/schema.types";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CustomBreadcrumb } from "@/components/custom-breadcrumb/breadcrumb-custom-component";

const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .regex(
      /^[a-zA-Z0-9._\- ]+$/,
      "Must start with a letter, digit, or underscore. Can contain dots, pluses, dashes, or spaces.",
    ),
  description: z.string().optional(),
  projectSlug: z.string().min(1, "Project slug is required"),
  visibility: z.enum(Object.values(VisibilityType) as [string, ...string[]]),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function NewProject() {
  // Hooks
  const { toast } = useToast();
  const router = useRouter();
  // Initialize the form with default values
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      projectSlug: "",
      visibility: VisibilityType.PRIVATE,
    },
  });

  // Handle form submission
  const onSubmit = async (data: ProjectFormValues) => {
    try {
      await APIService.post(UserAPI.project.create, data);
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
      router.push("/project");
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const projectName = form.watch("name");

  useEffect(() => {
    if (projectName) {
      const slug = projectName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/--+/g, "-");

      form.setValue("projectSlug", slug, { shouldValidate: true });
    } else {
      form.setValue("projectSlug", "");
    }
  }, [projectName, form.setValue]);

  return (
    <div className="container mx-auto py-6 px-4 ">
      <CustomBreadcrumb
        icon={<FileCode2 className="h-4 w-4" />}
        items={[
          { link: "/project", text: "Projects" },
          { link: "/project", text: "List Projects" },
          { link: "/project/new", text: "New Project" },
        ]}
      />

      <div className="max-w-screen mx-auto">
        <h1 className="text-3xl font-bold mb-2">Create blank project</h1>
        <p className="text-gray-600 mb-8">
          Start a new project to organize your files, manage tasks, and
          collaborate with your team. Give your project a name, add an optional
          description, and choose the right visibility level for your needs.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Project name</FormLabel>
                  <FormControl>
                    <Input placeholder="My awesome project" {...field} />
                  </FormControl>
                  <FormDescription>
                    Must start with a lowercase or uppercase letter, digit,
                    emoji, or underscore. Can also contain dots, pluses, dashes,
                    or spaces.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your project"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectSlug"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Project URL</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <Input
                        value="https://task-reminder.revnology.com/project/"
                        disabled
                        className="rounded-r-none bg-gray-50 bg-opacity-50"
                      />
                      <span className="px-2 py-2 border border-l-0 border-r-0 bg-gray-50 bg-opacity-50">
                        /
                      </span>
                      <Input
                        {...field}
                        className="rounded-l-none"
                        placeholder="my-awesome-project"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Visibility Level</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-4"
                    >
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem
                          value={VisibilityType.PRIVATE}
                          id={VisibilityType.PRIVATE}
                        />
                        <div className="grid gap-1.5">
                          <Label
                            htmlFor={VisibilityType.PRIVATE}
                            className="font-medium"
                          >
                            Private
                          </Label>
                          <p className="text-sm text-gray-500">
                            Project access must be granted explicitly to each
                            user. If this project is part of a group, access is
                            granted to members of the group.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem
                          value={VisibilityType.INTERNAL}
                          id={VisibilityType.INTERNAL}
                        />
                        <div className="grid gap-1.5">
                          <Label
                            htmlFor={VisibilityType.INTERNAL}
                            className="font-medium"
                          >
                            Internal
                          </Label>
                          <p className="text-sm text-gray-500">
                            The project can be accessed by any logged in user
                            except external users.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem
                          value={VisibilityType.PUBLIC}
                          id={VisibilityType.PUBLIC}
                        />
                        <div className="grid gap-1.5">
                          <Label
                            htmlFor={VisibilityType.PUBLIC}
                            className="font-medium"
                          >
                            Public
                          </Label>
                          <p className="text-sm text-gray-500">
                            The project can be accessed without any
                            authentication.
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button type="submit">Create project</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
