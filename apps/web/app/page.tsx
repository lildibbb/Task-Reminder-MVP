"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/components/spinner/loading-overlay";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { user, isInitialized, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (isInitialized && user && !loading) {
      router.replace("/task");
    }
  }, [mounted, isInitialized, user, router, loading]);

  if (!mounted) return null;

  if (!isInitialized || loading) {
    return (
      <LoadingOverlay
        isLoading={true}
        message="Loading..."
        variant="wave"
        size="large"
        backdropBlur="md"
        spinnerColor="green"
        spinnerSize="md"
      />
    );
  }
  if (isInitialized && !loading && user) {
    return (
      <LoadingOverlay
        isLoading={true}
        message="Loading..."
        variant="wave"
        size="large"
        backdropBlur="md"
        spinnerColor="green"
        spinnerSize="md"
      />
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background text-foreground">
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className="[mask-image:radial-gradient(800px_circle_at_center,white,transparent)] inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
      />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 z-50 flex w-full items-center justify-between p-2 md:p-4"
      >
        <div className="w-32 md:w-40">
          <Image
            src={`${process.env.NEXT_PUBLIC_ASSET_PREFIX}/images/icons/nav-logo.png`}
            alt="Revnology Logo"
            width={100}
            height={20}
            className="h-auto w-auto"
            priority
          />
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Link href="/login">
            <Button variant="ghost" className="font-medium">
              Login
            </Button>
          </Link>
        </div>
      </motion.header>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl "
        >
          Task Reminder System
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-8 max-w-2xl text-xl text-muted-foreground sm:text-2xl"
        >
          A simple and efficient way to manage your tasks and reminders.
        </motion.p>
      </div>
    </div>
  );
}
