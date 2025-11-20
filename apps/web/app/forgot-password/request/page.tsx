"use client";

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
import { Loader2, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { API } from "@/api";
import APIService from "@/api/apiService";
import { sendPasswordResetEmail } from "@/emails/reset-password-email";

const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
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

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    console.log(data);
    try {
      const response = await APIService.post(API.auth.forgotPassword, data);
      await sendPasswordResetEmail({
        to: data.email,
        email: data.email,
        name: "User",
        resetUrl: response.data.data.returnUrl,
      });
      setEmailSent(true);
      toast({
        title: "Reset link sent!",
        description: "Check your email for password reset instructions.",
        variant: "default",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
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
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Check Your Email
            </h1>
            <p className="text-muted-foreground">
              We've sent a password reset link to your email address. Please
              check your inbox and follow the instructions to reset your
              password.
            </p>
            <div className="mt-8">
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Back to Sign In
              </Link>
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
            Forgot Your Password?
          </h1>
          <p className="text-muted-foreground">
            Enter your email address and we'll send you a link to reset your
            password
          </p>
        </motion.div>

        <div className="bg-background rounded-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <motion.div variants={itemVariants}>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter your email address"
                          autoComplete="email"
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
                      Sending reset link...
                    </>
                  ) : (
                    "Send Reset Link"
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
                Back to Sign In
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
