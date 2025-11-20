"use client";

import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function OfflinePage() {
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
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  const pulseVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop" as const,
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
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6"
          variants={iconVariants}
          animate={["visible", "pulse"]}
        >
          <WifiOff className="h-10 w-10 text-muted-foreground" />
        </motion.div>

        <motion.h1 className="text-3xl font-bold mb-2" variants={itemVariants}>
          You&#39;re offline
        </motion.h1>

        <motion.p
          className="text-lg text-muted-foreground mb-6"
          variants={itemVariants}
        >
          It seems you&#39;ve lost your internet connection
        </motion.p>

        <motion.div
          className="bg-muted/50 rounded-lg p-6 mb-8"
          variants={itemVariants}
        >
          <p className="mb-4">
            Don&#39;t worry! Some features may still work while you&#39;re
            offline. We&#39;ll automatically try to reconnect you when your
            connection is restored.
          </p>

          <motion.div
            className="flex items-center justify-center space-x-2 text-sm text-muted-foreground"
            variants={pulseVariants}
            animate="pulse"
          >
            <div className="flex items-center">
              <motion.div
                className="mr-2 h-3 w-3 rounded-full bg-red-500"
                animate={{
                  opacity: [1, 0.5, 1],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                }}
              />
              <span>Currently offline</span>
            </div>
          </motion.div>
        </motion.div>

        <div className="space-y-4">
          <motion.div variants={itemVariants}>
            <Button
              className="w-full h-12 hover:scale-102 active:scale-95 transition-transform duration-200"
              onClick={() => router.refresh()}
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Try again
            </Button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              variant="outline"
              className="w-full h-12 hover:scale-102 active:scale-95 transition-transform duration-200"
              asChild
            >
              <Link href="/">
                <Wifi className="mr-2 h-5 w-5" />
                Return to homepage
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
