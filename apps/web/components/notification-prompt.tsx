"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
} from "@/components/ui/responsive-modal";
import {
  Bell,
  MessageSquare,
  Calendar,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { useNotification } from "@/hooks/useNotification";
import { useAuth } from "@/hooks/useAuth";



function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

export default function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [step, setStep] = useState<"prompt" | "success">("prompt");

  const { user, loading: userLoading } = useAuth();
  const { subscribeNotification } = useNotification();

  useEffect(() => {
    if (userLoading || !user?.id) return;
    checkIfShouldShowPrompt();
  }, [user, userLoading]);

  const checkIfShouldShowPrompt = async () => {
    if (
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setIsSupported(false);
      return;
    }

    const hasBeenPrompted = localStorage.getItem(
      `notification-prompted-${user?.id}`
    );
    if (hasBeenPrompted) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        localStorage.setItem(`notification-prompted-${user?.id}`, "true");
        return;
      }

      if (Notification.permission === "denied") {
        localStorage.setItem(`notification-prompted-${user?.id}`, "true");
        return;
      }

   
      setTimeout(() => setShowPrompt(true), 1500);
    } catch (error) {
      console.error("Error checking subscription status:", error);
      setIsSupported(false);
    }
  };

  const handleEnableNotifications = async () => {
    if (!isSupported || !user?.id) return;

    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setShowPrompt(false);
        localStorage.setItem(`notification-prompted-${user?.id}`, "true");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
        ),
      });

      const subscriptionJSON = subscription.toJSON();
      if (subscriptionJSON.endpoint && subscriptionJSON.keys) {
        await subscribeNotification({
          endpoint: subscriptionJSON.endpoint,
          keys: {
            p256dh: subscriptionJSON.keys.p256dh || "",
            auth: subscriptionJSON.keys.auth || "",
          },
        });
      }

      setStep("success");

      setTimeout(() => {
        setShowPrompt(false);
        localStorage.setItem(`notification-prompted-${user?.id}`, "true");
      }, 2500);
    } catch (error) {
      console.error("Failed to enable notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(`notification-prompted-${user?.id}`, "true");
  };

  if (!isSupported || !showPrompt) return null;

  return (
    <ResponsiveModal open={showPrompt} onOpenChange={setShowPrompt}>

      <ResponsiveModalContent className="sm:max-w-[420px] p-0 overflow-hidden gap-0 border-0 ring-0">
        <AnimatePresence mode="wait">
          {step === "prompt" ? (
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col"
            >
         
              <div className="relative h-32 w-full bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center overflow-hidden">
           
                <div className="absolute top-[-20px] right-[-20px] h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
                <div className="absolute bottom-[-20px] left-[-20px] h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />
                
          
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-background shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                  <Bell className="h-8 w-8 text-primary fill-primary/20" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 ring-2 ring-background">
                     <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                </div>
              </div>

              <div className="px-6 pt-6 pb-2 text-center">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Don't Miss a Beat
                </h2>
                <p className="mt-2 text-[15px] text-muted-foreground leading-relaxed">
                   Enable push notifications to get instant updates on your tasks, team comments, and deadlines.
                </p>

                <div className="mt-6 grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center gap-2 rounded-lg border border-border/50 bg-muted/20 p-3">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        <span className="text-xs font-medium">Deadlines</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 rounded-lg border border-border/50 bg-muted/20 p-3">
                        <MessageSquare className="h-5 w-5 text-green-500" />
                        <span className="text-xs font-medium">Mentions</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 rounded-lg border border-border/50 bg-muted/20 p-3">
                        <Zap className="h-5 w-5 text-orange-500" />
                        <span className="text-xs font-medium">Updates</span>
                    </div>
                </div>
              </div>

     
              <div className="p-6 pt-4 flex flex-col gap-3">
                <Button
                  size="lg"
                  onClick={handleEnableNotifications}
                  disabled={isLoading}
                  className="w-full rounded-full font-medium shadow-lg shadow-primary/20"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span>Enabling...</span>
                    </div>
                  ) : (
                    "Turn On Notifications"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-muted-foreground hover:text-foreground hover:bg-transparent"
                >
                  No thanks, I'll check manually
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col items-center justify-center min-h-[300px] text-center p-6"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20">
                <ShieldCheck className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">Enabled!</h3>
              <p className="mt-2 text-muted-foreground max-w-[260px]">
                You're all set. We'll let you know when something important happens.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}