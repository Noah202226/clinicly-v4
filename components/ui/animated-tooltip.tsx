"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

export function AnimatedTooltip({
  children,
  content,
  disabled = false,
}: {
  children: React.ReactNode;
  content: string;
  disabled?: boolean;
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip disableHoverableContent={disabled}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>

        {!disabled && (
          <TooltipContent side="right" align="center">
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              {content}
            </motion.div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
