"use client";

import { motion, AnimatePresence } from "framer-motion";
import { memo } from "react";
import GlobalSpinner from "./global-spinner";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  variant?: "default" | "dots" | "pulse" | "orbit" | "wave";
  backdrop?: boolean;
  backdropBlur?: "none" | "sm" | "md" | "lg";
  size?: "small" | "medium" | "large";
  theme?: "light" | "dark";
  className?: string;
  spinnerColor?: string;
  spinnerSize?: "sm" | "md" | "lg" | "xl";
}

const LoadingOverlay = memo(
  ({
    isLoading,
    message = "Loading...",
    variant = "orbit",
    backdrop = true,
    backdropBlur = "sm",
    size = "medium",
    theme = "light",
    className,
    spinnerColor = "green",
    spinnerSize = "lg",
  }: LoadingOverlayProps) => {
    const validVariants = ["default", "dots", "pulse", "orbit", "wave"];
    const safeVariant = validVariants.includes(variant) ? variant : "orbit";

    const sizeStyles = {
      small: "max-w-xs sm:max-w-sm",
      medium: "max-w-sm sm:max-w-md",
      large: "max-w-md sm:max-w-lg",
    };

    const themeStyles = {
      light: "bg-white/90 text-slate-600 border-white/30",
      dark: "bg-slate-900/90 text-slate-200 border-slate-700/50",
    };

    const backdropClass = backdrop
      ? backdropBlur === "sm"
        ? "backdrop-blur-sm"
        : backdropBlur === "md"
          ? "backdrop-blur-md"
          : backdropBlur === "lg"
            ? "backdrop-blur-lg"
            : ""
      : "";

    return (
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center p-4",
              backdrop && "bg-black/20",
              backdropClass,
              className,
            )}
            role="alert"
            aria-live="assertive"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={cn(
                "flex flex-col items-center rounded-xl border p-6 shadow-2xl",
                sizeStyles[size],
                themeStyles[theme],
                "space-y-4 sm:space-y-6",
              )}
              style={{ willChange: "transform, opacity" }}
            >
              <GlobalSpinner
                variant={safeVariant}
                size={spinnerSize}
                color={
                  ["green", "blue", "orange", "purple"].includes(spinnerColor)
                    ? spinnerColor
                    : "green"
                }
                className={cn(
                  spinnerSize === "sm" && "h-6 w-6",
                  spinnerSize === "md" && "h-8 w-8",
                  spinnerSize === "lg" && "h-10 w-10",
                  spinnerSize === "xl" && "h-12 w-12",
                )}
                aria-label="Loading indicator"
              />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className={cn(
                  "px-2 text-center text-sm font-medium leading-relaxed",
                  theme === "light" ? "text-slate-600" : "text-slate-200",
                  size === "large" && "md:text-base",
                )}
              >
                {message}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);

LoadingOverlay.displayName = "LoadingOverlay";

export default LoadingOverlay;
