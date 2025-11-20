"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import LoadingOverlay from "@/components/spinner/loading-overlay";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

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
  }, [isInitialized, user, router, loading]);

  if (!mounted || !isInitialized || loading || user) {
    return (
      <LoadingOverlay
        isLoading={true}
        message={user ? "Redirecting to dashboard..." : "Loading..."}
        variant="wave"
        size="large"
        backdropBlur="md"
        spinnerColor="green"
        spinnerSize="md"
      />
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background text-foreground">

      <AnimatedGridPattern
        numSquares={15}
        maxOpacity={0.08}
        duration={4}
        repeatDelay={2}
        className="[mask-image:radial-gradient(900px_circle_at_center,white,transparent)] inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
      />


      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-border/40 bg-background px-6 py-3"
      >
        <div className="flex items-center gap-2">
          <Image
            src={`${process.env.NEXT_PUBLIC_ASSET_PREFIX}/images/icons/nav-logo.png`}
            alt="Revnology Logo"
            width={100}
            height={20}
            className="h-8 w-auto"
            priority
          />
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Link href="/login">
            <Button size="sm" className="font-medium">
              Login
            </Button>
          </Link>
        </div>
      </motion.header>


      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pt-20 text-center md:pt-32">
      
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm font-normal">
            <Sparkles className="mr-2 h-3.5 w-3.5 text-orange-500" />
            <span>v2.0 is now live</span>
          </Badge>
        </motion.div>

      
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl"
        >
          Master your workflow with <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-green-600 to-emerald-400 bg-clip-text text-transparent dark:from-green-400 dark:to-emerald-600">
            Task Reminder System
          </span>
        </motion.h1>

      
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          Streamline your daily objectives with an intelligent reminder system designed for developers and teams. Simple, efficient, and distraction-free.
        </motion.p>

   
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link href="/login">
            <Button size="lg" className="h-12 rounded-full px-8 text-base">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="h-12 rounded-full px-8 text-base">
            View Features
          </Button>
        </motion.div>

     
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="relative mt-16 w-full max-w-5xl"
          style={{ willChange: "transform" }}
        >
       
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 opacity-40 blur-xl" />
          
          <div className="relative overflow-hidden rounded-xl border border-border/50 bg-background/90 shadow-2xl">

            <div className="relative z-10 flex items-center gap-2 border-b border-border/50 bg-background px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
            
          
            <div className="relative w-full overflow-hidden bg-gradient-to-br from-muted/50 to-muted/10">
            <Image
              src={`${process.env.NEXT_PUBLIC_ASSET_PREFIX}/images/icons/mockup-dashboard.png`}
              alt="Dashboard Screenshot"
              width={1280}        
              height={720}        
              className="h-auto w-full object-contain"
              priority
              quality={85}
            />
          </div>

          </div>
        </motion.div>


        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 pb-10 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Real-time Sync</div>
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Dark Mode Support</div>
        </motion.div>
      </main>
    </div>
  );
}
