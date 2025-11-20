"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, LogIn, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.15,
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

  const iconVariants = {
    hidden: { scale: 0, rotate: -180, opacity: 0 },
    visible: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  const numberVariants = {
    hidden: { opacity: 0, scale: 1.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.43, 0.13, 0.23, 0.96],
      },
    },
  };

  const lineVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <motion.div
        className="w-full max-w-md text-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-6"
          variants={iconVariants}
        >
          <AlertTriangle className="h-12 w-12 text-muted-foreground" />
        </motion.div>

        <motion.h1
          className="text-5xl font-bold mb-2"
          variants={numberVariants}
        >
          401
        </motion.h1>

        <motion.h2
          className="text-2xl font-semibold mb-4"
          variants={itemVariants}
        >
          Unauthorized
        </motion.h2>

        <motion.p
          className="text-muted-foreground mb-8"
          variants={itemVariants}
        >
          You need to be logged in to access this page. Please authenticate
          yourself to continue.
        </motion.p>

        <motion.div
          className="h-[1px] w-full bg-border my-6"
          variants={lineVariants}
        />

        <motion.p
          className="text-sm text-muted-foreground mb-6"
          variants={itemVariants}
        >
          Here are some helpful options:
        </motion.p>

        <div className="space-y-4">
          <motion.div variants={itemVariants}>
            <Button
              className="w-full h-12 hover:scale-102 active:scale-95 transition-transform duration-200"
              asChild
            >
              <Link href="/login">
                <LogIn className="mr-2 h-5 w-5" />
                Sign In
              </Link>
            </Button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              variant="outline"
              className="w-full h-12 hover:scale-102 active:scale-95 transition-transform duration-200"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
