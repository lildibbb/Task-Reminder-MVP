"use client";
import { useEffect } from "react";

const PWAInstaller = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        if (registrations.length === 0) {
          navigator.serviceWorker
            .register("/service-worker.js", { scope: "/" })
            .then((registration) => {
              console.log(
                "Service Worker registered with scope:",
                registration.scope,
              );
            })
            .catch((error) => {
              console.error("Service Worker registration failed:", error);
            });
        } else {
          console.log("Service Worker already registered:", registrations);
        }
      });
    }
  }, []);

  return null;
};

export default PWAInstaller;
