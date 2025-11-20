"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import { cn } from "@/lib/utils";

interface GlobalSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dots" | "pulse" | "orbit" | "wave";
  className?: string;
  color?: "green" | "blue" | "purple" | "orange" | string; // Updated to accept any string
}

const GlobalSpinner = memo(
  ({
    size = "md",
    variant = "default",
    className,
    color = "green",
  }: GlobalSpinnerProps) => {
    const sizeClasses = {
      sm: "w-6 h-6",
      md: "w-8 h-8",
      lg: "w-10 h-10",
      xl: "w-12 h-12",
    };

    const colorClasses = {
      green: "text-green-500",
      blue: "text-blue-500",
      purple: "text-purple-500",
      orange: "text-orange-500",
    };

    const resolvedColor =
      colorClasses[color as keyof typeof colorClasses] || color;

    // CSS keyframes for animations
    const cssKeyframes = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.5; }
      }
      @keyframes wave {
        0%, 100% { transform: scaleY(1); opacity: 0.5; }
        50% { transform: scaleY(2); opacity: 1; }
      }
    `;

    if (variant === "dots") {
      return (
        <>
          <style>{cssKeyframes}</style>
          <div
            className={cn("flex space-x-1", className)}
            aria-label="Loading dots"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn(
                  "rounded-full bg-current",
                  size === "sm"
                    ? "w-1.5 h-1.5"
                    : size === "md"
                      ? "w-2 h-2"
                      : size === "lg"
                        ? "w-2.5 h-2.5"
                        : "w-3 h-3",
                  resolvedColor,
                )}
                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                style={{
                  animation: "pulse 0.6s infinite ease-in-out",
                  willChange: "transform",
                }}
              />
            ))}
          </div>
        </>
      );
    }

    if (variant === "pulse") {
      return (
        <>
          <style>{cssKeyframes}</style>
          <div
            className={cn(
              "rounded-full border-2 border-current",
              sizeClasses[size],
              resolvedColor,
              className,
            )}
            style={{
              animation: "pulse 1.5s infinite ease-in-out",
              willChange: "transform",
            }}
            aria-label="Loading pulse"
          />
        </>
      );
    }

    if (variant === "orbit") {
      return (
        <div
          className={cn("relative", sizeClasses[size], className)}
          aria-label="Loading orbit"
        >
          <motion.div
            className={cn(
              "absolute inset-0 rounded-full border-2 border-transparent",
              resolvedColor,
            )}
            style={{
              borderTopColor: "currentColor",
              animation: "spin 1s infinite linear",
              willChange: "transform",
            }}
          />
          <div className={cn("text-transparent", resolvedColor)}>.</div>
        </div>
      );
    }

    if (variant === "wave") {
      return (
        <div
          className={cn("flex space-x-1", className)}
          aria-label="Loading wave"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className={cn(
                "bg-current rounded-sm",
                size === "sm"
                  ? "w-1 h-4"
                  : size === "md"
                    ? "w-1 h-6"
                    : size === "lg"
                      ? "w-1.5 h-8"
                      : "w-2 h-10",
                resolvedColor,
              )}
              animate={{ scaleY: [1, 2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut",
              }}
              style={{
                animation: `wave 1s ${i * 0.1}s infinite ease-in-out`,
                willChange: "transform",
              }}
            />
          ))}
        </div>
      );
    }

    // Default spinner
    return (
      <>
        <style>{cssKeyframes}</style>
        <div
          className={cn(
            "rounded-full border-2 border-transparent border-t-current",
            sizeClasses[size],
            resolvedColor,
            className,
          )}
          style={{
            animation: "spin 1s infinite linear",
            willChange: "transform",
          }}
          aria-label="Loading spinner"
        />
      </>
    );
  },
);

GlobalSpinner.displayName = "GlobalSpinner";

export default GlobalSpinner;
