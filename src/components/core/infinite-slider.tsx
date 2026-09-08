import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InfiniteSliderProps {
  children: ReactNode;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  duration?: number;
  className?: string;
}

export function InfiniteSlider({
  children,
  direction = "horizontal",
  reverse = false,
  duration = 20,
  className,
}: InfiniteSliderProps) {
  const isVertical = direction === "vertical";

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        isVertical ? "h-full flex flex-col" : "w-full flex flex-row",
        className
      )}
    >
      <motion.div
        className={cn(
          "flex shrink-0",
          isVertical ? "flex-col gap-4 min-h-max" : "flex-row gap-4 min-w-max"
        )}
        animate={
          isVertical
            ? { y: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }
            : { x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }
        }
        transition={{
          duration,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
