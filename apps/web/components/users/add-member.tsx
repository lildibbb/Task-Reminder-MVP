"use client";

import { AdminAPI } from "@/api/admin";
import APIService from "@/api/apiService";
import { sendTeamInvitationEmail } from "@/emails/invite-user-email";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types/schema.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from "../ui/responsive-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const inviteUserFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  userType: z.enum([UserRole.USER, UserRole.ADMIN], {
    required_error: "Role is required",
  }),
});

type InviteUserFormValues = z.infer<typeof inviteUserFormSchema>;

export function AddMember() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<InviteUserFormValues>({
    resolver: zodResolver(inviteUserFormSchema),
    defaultValues: {
      email: "",
      userType: UserRole.USER,
    },
  });

  async function onSubmit(values: InviteUserFormValues) {
    setIsLoading(true);
    try {
      const response = await APIService.post(AdminAPI.users.invite, values);
      console.log("User invited successfully:", response.data.data.return_url);
      await sendTeamInvitationEmail({
        to: values.email,
        email: values.email,
        name: "User", // TODO: Get the user's name from the response or another source
        role: values.userType,
        returnUrl: response.data.data.return_url,
      });
      toast({
        title: "Invitation sent!",
        description: "Invitation sent successfully",
        variant: "default",
      });

      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error inviting user!",
        description: "User already exist",
        variant: "destructive",
      });
      console.error("Error inviting user:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ResponsiveModal open={open} onOpenChange={setOpen}>
      <ResponsiveModalTrigger asChild>
        <Button variant="link" size="sm">
          Invite member
        </Button>
      </ResponsiveModalTrigger>

      <ResponsiveModalContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ResponsiveModalHeader>
              <ResponsiveModalTitle>Invite members</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                You're inviting members to the <b>Group</b>.
              </ResponsiveModalDescription>
            </ResponsiveModalHeader>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      {...field}
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UserRole.USER}>User</SelectItem>
                        <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Invited members are limited to this role{" "}
                    <a href="#" className="underline">
                      Learn more about roles.
                    </a>
                  </p>
                </FormItem>
              )}
            />

            <ResponsiveModalFooter className="space-y-reverse space-y-4 sm:space-y-0">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Inviting..." : "Invite"}
              </Button>
            </ResponsiveModalFooter>
          </form>
        </Form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
