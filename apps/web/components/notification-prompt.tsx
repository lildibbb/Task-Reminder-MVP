"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import {
  Bell,
  CheckCircle,
  MessageSquare,
  Calendar,
  Users,
} from "lucide-react";
import { useNotification } from "@/hooks/useNotification";
import { useAuth } from "@/hooks/useAuth";

// Convert base64 string to Uint8Array to match VAPID key format
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

const notificationFeatures = [
  {
    icon: Calendar,
    title: "Task Deadlines",
    description: "Never miss important due dates",
  },
  {
    icon: MessageSquare,
    title: "Comments & Mentions",
    description: "Stay in the loop with team discussions",
  },
  {
    icon: Users,
    title: "Team Updates",
    description: "Get notified about project changes",
  },
];

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
    // Check if notifications are supported
    if (
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setIsSupported(false);
      return;
    }

    // Check if user has already been prompted (stored in localStorage)
    const hasBeenPrompted = localStorage.getItem(
      `notification-prompted-${user?.id}`,
    );
    if (hasBeenPrompted) {
      return;
    }

    // Check if user is already subscribed
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription =
        await registration.pushManager.getSubscription();

      if (existingSubscription) {
        // User is already subscribed, mark as prompted
        localStorage.setItem(`notification-prompted-${user?.id}`, "true");
        return;
      }

      // Check current permission status
      if (Notification.permission === "denied") {
        // User has denied permissions, don't show prompt again
        localStorage.setItem(`notification-prompted-${user?.id}`, "true");
        return;
      }

      // Show the prompt after a short delay for better UX
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
        console.log("Notification permission not granted");
        setShowPrompt(false);
        localStorage.setItem(`notification-prompted-${user?.id}`, "true");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
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

      // Show success state
      setStep("success");

      // Auto close after showing success
      setTimeout(() => {
        setShowPrompt(false);
        localStorage.setItem(`notification-prompted-${user?.id}`, "true");
      }, 2000);
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

  if (!isSupported || !showPrompt) {
    return null;
  }

  return (
    <ResponsiveModal open={showPrompt} onOpenChange={setShowPrompt}>
      <ResponsiveModalContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {step === "prompt" ? (
            <motion.div
              key="prompt"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ResponsiveModalHeader className="text-center pb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto mb-4"
                >
                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg mx-auto">
                      <Bell className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 rounded-full bg-primary/50 -z-10"
                    />
                  </div>
                </motion.div>

                <ResponsiveModalTitle className="text-2xl font-bold text-foreground">
                  Stay in the Loop
                </ResponsiveModalTitle>
                <ResponsiveModalDescription className="text-base text-muted-foreground">
                  Enable notifications to never miss important updates.
                </ResponsiveModalDescription>
              </ResponsiveModalHeader>

              <div className="space-y-3 py-4">
                {notificationFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                  >
                    {/* Changed to primary color */}
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <feature.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {feature.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <ResponsiveModalFooter className="pt-6 gap-3">
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  className="flex-1 sm:flex-none"
                >
                  Maybe Later
                </Button>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    onClick={handleEnableNotifications}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                        className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                      />
                    ) : (
                      "Enable Notifications"
                    )}
                  </Button>
                </motion.div>
              </ResponsiveModalFooter>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg mx-auto">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-foreground mb-2"
              >
                You're All Set! 🎉
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground"
              >
                You'll now receive notifications for important updates.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
