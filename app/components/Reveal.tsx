import type { CSSProperties, ElementType, ReactNode } from "react";

/**
 * Scroll-reveal without JavaScript. Browsers that support scroll-driven animations (Chrome, Edge, Safari 26+) let the block rise in
 * as it enters the screen; everywhere else the content is simply visible. Content that is already on screen when the page loads
 * is never hidden, so it cannot delay the first paint or the largest content (see .reveal in globals.css).
 */
type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** kept for older call sites; staggering is done with CSS now */
  delay?: number;
  /** animation flavour */
  variant?: "up" | "left" | "right" | "zoom";
};

export default function Reveal({ children, as: Tag = "div", className = "", variant = "up" }: Props) {
  const style: CSSProperties | undefined = undefined;
  return (
    <Tag className={`reveal reveal-${variant} ${className}`} style={style}>
      {children}
    </Tag>
  );
}
