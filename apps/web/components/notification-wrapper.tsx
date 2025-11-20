"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationPrompt from "./notification-prompt";

export default function NotificationWrapper() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // delay to load all first
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isMounted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <NotificationPrompt />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
