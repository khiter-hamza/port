"use client"

import { motion, useInView, type Variants } from "motion/react"
import { useRef, type ReactNode } from "react"

type Direction = "up" | "down" | "left" | "right" | "none"

interface MotionRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: Direction
  distance?: number
  once?: boolean
  as?: "div" | "section" | "span" | "li" | "article"
}

const offsetFor = (direction: Direction, distance: number) => {
  switch (direction) {
    case "up":
      return { x: 0, y: distance }
    case "down":
      return { x: 0, y: -distance }
    case "left":
      return { x: distance, y: 0 }
    case "right":
      return { x: -distance, y: 0 }
    default:
      return { x: 0, y: 0 }
  }
}

export function MotionReveal({
  children,
  className,
  delay = 0,
  duration = 1.1,
  direction = "up",
  distance = 60,
  once = true,
  as = "div",
}: MotionRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once, margin: "0px 0px -10% 0px", amount: 0.15 })
  const offset = offsetFor(direction, distance)

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: offset.x,
      y: offset.y,
      filter: "blur(12px)",
      scale: 0.97,
      clipPath: "inset(0 0 100% 0)",
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      scale: 1,
      clipPath: "inset(0 0 0% 0)",
      transition: {
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  const MotionTag = motion[as] as typeof motion.div
  return (
    <MotionTag
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </MotionTag>
  )
}

/**
 * Reveals each child of a parent with a staggered cascade.
 * Children must be direct flex/grid items.
 */
export function MotionStagger({
  children,
  className,
  delay = 0,
  stagger = 0.08,
  direction = "up",
  distance = 40,
  once = true,
}: {
  children: ReactNode
  className?: string
  delay?: number
  stagger?: number
  direction?: Direction
  distance?: number
  once?: boolean
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once, margin: "0px 0px -10% 0px", amount: 0.1 })
  const offset = offsetFor(direction, distance)

  const parent: Variants = {
    hidden: {},
    visible: {
      transition: { delayChildren: delay, staggerChildren: stagger },
    },
  }
  const child: Variants = {
    hidden: { opacity: 0, x: offset.x, y: offset.y, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <motion.div
      ref={ref}
      variants={parent}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {Array.isArray(children)
        ? children.map((c, i) => (
            <motion.div key={i} variants={child}>
              {c}
            </motion.div>
          ))
        : <motion.div variants={child}>{children}</motion.div>}
    </motion.div>
  )
}

/**
 * Animates each word/letter in a string for cinematic title reveals.
 */
export function MotionText({
  text,
  className,
  delay = 0,
  splitBy = "word",
  as: Tag = "span",
}: {
  text: string
  className?: string
  delay?: number
  splitBy?: "word" | "char"
  as?: keyof React.JSX.IntrinsicElements
}) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px", amount: 0.2 })

  const segments =
    splitBy === "char" ? Array.from(text) : text.split(/(\s+)/)

  const parent: Variants = {
    hidden: {},
    visible: {
      transition: { delayChildren: delay, staggerChildren: splitBy === "char" ? 0.02 : 0.05 },
    },
  }
  const child: Variants = {
    hidden: { y: "110%", opacity: 0, rotateZ: 4 },
    visible: {
      y: "0%",
      opacity: 1,
      rotateZ: 0,
      transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      <motion.span
        variants={parent}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        style={{ display: "inline-block" }}
        aria-hidden
      >
        {segments.map((seg, i) =>
          /^\s+$/.test(seg) ? (
            <span key={i}>{seg}</span>
          ) : (
            <span
              key={i}
              style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
            >
              <motion.span
                variants={child}
                style={{ display: "inline-block", willChange: "transform" }}
              >
                {seg}
              </motion.span>
            </span>
          ),
        )}
      </motion.span>
    </Tag>
  )
}
