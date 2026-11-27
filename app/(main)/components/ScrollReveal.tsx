"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { ReactNode } from "react";

type Variant = "fadeUp" | "fadeIn" | "fadeLeft" | "fadeRight" | "zoom";

const variants: Record<Variant, Variants> = {
  fadeUp:    { hidden: { opacity: 0, y: 36 },       visible: { opacity: 1, y: 0 } },
  fadeIn:    { hidden: { opacity: 0 },               visible: { opacity: 1 } },
  fadeLeft:  { hidden: { opacity: 0, x: -32 },      visible: { opacity: 1, x: 0 } },
  fadeRight: { hidden: { opacity: 0, x: 32 },       visible: { opacity: 1, x: 0 } },
  zoom:      { hidden: { opacity: 0, scale: 0.94 }, visible: { opacity: 1, scale: 1 } },
};

interface Props {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  duration?: number;
  className?: string;
}

export default function ScrollReveal({
  children,
  variant = "fadeUp",
  delay = 0,
  duration = 0.6,
  className,
}: Props) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={variants[variant]}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
