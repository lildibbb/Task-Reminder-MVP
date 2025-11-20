"use client";

import { useCallback } from "react";
import APIService from "@/api/apiService";
import { UserAPI } from "@/api/user";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

interface SubscriptionKeys {
  p256dh: string;
  auth: string;
}

interface PushSubscription {
  endpoint: string;
  keys: SubscriptionKeys;
}

export const useNotification = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const currentUserId = user?.id;
  // Subscribe to push notifications
  const subscribeNotification = useCallback(
    async (subscription: PushSubscription) => {
      try {
        const url = UserAPI.subscription.createOrUpdate.replace(
          "{id}",
          String(currentUserId),
        );
        // Send the subscription object in the body
        await APIService.put(url, { subscription });

        toast({
          title: "Successfully subscribed to push notifications",
          description: "You will now receive notifications.",
          variant: "default",
        });
      } catch (error) {
        console.error("Error subscribing to notifications:", error);
        toast({
          title: "Subscription failed",
          description: "Could not subscribe to notifications.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [currentUserId, toast],
  );

  // Unsubscribe from push notifications
  const unsubscribeNotification = useCallback(async () => {
    try {
      const url = UserAPI.subscription.delete.replace(
        "{id}",
        String(currentUserId),
      );
      await APIService.delete(url);

      toast({
        title: "Successfully unsubscribed from push notifications",
        description: "You will no longer receive notifications.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error unsubscribing from notifications:", error);
      toast({
        title: "Unsubscribe failed",
        description: "Could not unsubscribe from notifications.",
        variant: "destructive",
      });
      throw error;
    }
  }, [currentUserId, toast]);

  return {
    subscribeNotification,
    unsubscribeNotification,
  };
};
