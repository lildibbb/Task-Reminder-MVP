"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface DotPosition {
  x: number;
  y: number;
  duration: number;
  delay: number;
}

export default function SplashScreen() {
  const [isClient, setIsClient] = useState(false);
  const [dotPositions, setDotPositions] = useState<DotPosition[]>([]);

  useEffect(() => {
    setIsClient(true);

    const newDotPositions = Array.from({ length: 10 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setDotPositions(newDotPositions);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden px-4 relative">
      {" "}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center space-y-6 md:space-y-8 z-10" // Added z-10
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative"
        >
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(34, 197, 94, 0)",
                "0 0 0 15px rgba(34, 197, 94, 0.1)",
                "0 0 0 0 rgba(34, 197, 94, 0)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="rounded-xl md:rounded-2xl p-4 md:p-6 bg-white/80 backdrop-blur-sm border border-white/20"
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_ASSET_PREFIX}/images/icons/nav-logo.png`}
              alt="REVNOLOGY"
              width={300}
              height={150}
              className="w-64 md:w-80 lg:w-96 h-auto"
              priority
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
          </motion.div>
        </motion.div>
      </motion.div>
      {isClient && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {dotPositions.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400/20 rounded-full"
              initial={{
                x: pos.x,
                y: pos.y,
                opacity: 0,
              }}
              animate={{
                y: [pos.y, pos.y - (Math.random() * 100 + 50)],
                opacity: [0, 0.7, 0],
              }}
              transition={{
                duration: pos.duration,
                repeat: Number.POSITIVE_INFINITY,
                delay: pos.delay,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
