"use client";

import APIService from "@/api/apiService";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { API } from "@/api";
import { sendPasswordResetSuccessEmail } from "@/emails/password-reset-sucess-email";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z\d\s]/, {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const logoVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const dataWithToken = {
        password: data.password,
        token: token,
      };

      const response = await APIService.put(
        API.auth.resetPassword,
        dataWithToken,
      );
      await sendPasswordResetSuccessEmail({
        to: response.data.data.email,
        email: response.data.data.email,
        name: response.data.data.name,
      });
      setResetComplete(true);
      toast({
        title: "Password reset successful!",
        description: "You can now log in with your new password.",
        variant: "default",
      });
    } catch (err: any) {
      toast({
        title: "Reset failed",
        description: "Token may have expired or is invalid",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  if (resetComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 md:py-12 md:px-6">
        <motion.div
          className="w-full max-w-md text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            className="flex justify-center mb-6"
            variants={logoVariants}
          >
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <Image
                src={`${process.env.NEXT_PUBLIC_ASSET_PREFIX}/images/icons/nav-logo.png`}
                alt="Logo"
                width={80}
                height={44}
                priority
              />
            </div>
          </motion.div>

          <motion.div className="space-y-4" variants={itemVariants}>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Password Reset Complete
            </h1>
            <p className="text-muted-foreground">
              Your password has been successfully reset. You can now log in with
              your new password.
            </p>
            <div className="mt-8">
              <Button
                onClick={() => router.push("/login")}
                className="w-full h-12 text-base hover:scale-105 active:scale-95 transition-transform duration-200"
                size="lg"
              >
                Go to Login
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 md:py-12 md:px-6">
        <motion.div
          className="w-full max-w-md text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            className="flex justify-center mb-6"
            variants={logoVariants}
          >
            <div className="bg-white rounded-lg p-2 shadow-sm">
              <Image
                src={`${process.env.NEXT_PUBLIC_ASSET_PREFIX}/images/icons/nav-logo.png`}
                alt="Logo"
                width={80}
                height={44}
                priority
              />
            </div>
          </motion.div>

          <motion.div className="space-y-4" variants={itemVariants}>
            <h1 className="text-2xl font-bold tracking-tight">
              Invalid Reset Link
            </h1>
            <p className="text-muted-foreground">
              The password reset link is invalid or has expired. Please request
              a new password reset.
            </p>
            <div className="mt-8">
              <Button
                onClick={() => router.push("/forgot-password")}
                className="w-full h-12 text-base hover:scale-105 active:scale-95 transition-transform duration-200"
                size="lg"
              >
                Request New Reset Link
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8 md:py-12 md:px-6">
      <motion.div
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="flex justify-center mb-6"
          variants={logoVariants}
        >
          <div className="bg-white rounded-lg p-2 shadow-sm">
            <Image
              src={`${process.env.NEXT_PUBLIC_ASSET_PREFIX}/images/icons/nav-logo.png`}
              alt="Logo"
              width={80}
              height={44}
              priority
            />
          </div>
        </motion.div>

        <motion.div
          className="space-y-2 text-center mb-8"
          variants={itemVariants}
        >
          <h1 className="text-2xl font-bold tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-muted-foreground">
            Please enter a new secure password for your account
          </p>
        </motion.div>

        <div className="bg-background rounded-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a secure password"
                            autoComplete="new-password"
                            className="h-12 px-4 focus-visible:ring-primary"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-500" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-500" />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">
                        Confirm New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                          className="h-12 px-4 focus-visible:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  className="w-full h-12 mt-6 text-base hover:scale-105 active:scale-95 transition-transform duration-200"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Resetting password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </motion.div>
            </form>
          </Form>

          <motion.div className="mt-8 text-center" variants={itemVariants}>
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
